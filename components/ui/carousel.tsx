'use client';

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    CarouselProps & {
      autoplay?: {
        delay?: number;
        stopOnInteraction?: boolean;
      };
    }
>(({ orientation = 'horizontal', opts, setApi, plugins = [], autoplay, className, children, ...props }, ref) => {
  const autoplayPlugin = React.useMemo(
    () =>
      Autoplay({
        delay: autoplay?.delay || 4000,
        stopOnInteraction: autoplay?.stopOnInteraction ?? true,
        playOnInit: false,
      }),
    [autoplay]
  );

  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    [...plugins, autoplayPlugin]
  );

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    api.plugins().autoplay.play();
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) {
      return;
    }

    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);

    return () => {
      api?.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role='region'
        aria-roledescription='carousel'
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});
Carousel.displayName = 'Carousel';

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();

    return (
      <div ref={carouselRef} className='overflow-hidden'>
        <div
          ref={ref}
          className={cn('flex', orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className)}
          {...props}
        />
      </div>
    );
  }
);
CarouselContent.displayName = 'CarouselContent';

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel();

    return (
      <div
        ref={ref}
        role='group'
        aria-roledescription='slide'
        className={cn('min-w-0 shrink-0 grow-0 basis-full', orientation === 'horizontal' ? 'pl-4' : 'pt-4', className)}
        {...props}
      />
    );
  }
);
CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn('h-8 w-8 rounded-full', orientation === 'vertical' && 'rotate-90', className)}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <ChevronLeftIcon className='h-4 w-4' />
        <span className='sr-only'>Previous slide</span>
      </Button>
    );
  }
);
CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn('h-8 w-8 rounded-full', orientation === 'vertical' && 'rotate-90', className)}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <ChevronRightIcon className='h-4 w-4' />
        <span className='sr-only'>Next slide</span>
      </Button>
    );
  }
);
CarouselNext.displayName = 'CarouselNext';

const CarouselDots = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { api } = useCarousel();
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

    const onDotButtonClick = React.useCallback(
      (index: number) => {
        if (!api) return;
        api.scrollTo(index);
      },
      [api]
    );

    const onSelect = React.useCallback(() => {
      if (!api) return;
      setSelectedIndex(api.selectedScrollSnap());
    }, [api]);

    const onInit = React.useCallback(() => {
      if (!api) return;
      setScrollSnaps(api.scrollSnapList());
    }, [api]);

    React.useEffect(() => {
      if (!api) return;

      onInit();
      onSelect();
      api.on('reInit', onInit);
      api.on('reInit', onSelect);
      api.on('select', onSelect);

      return () => {
        api?.off('reInit', onInit);
        api?.off('reInit', onSelect);
        api?.off('select', onSelect);
      };
    }, [api, onInit, onSelect]);

    if (scrollSnaps.length <= 1) return null;

    return (
      <div ref={ref} className={cn('mt-4 flex items-center justify-center space-x-2', className)} {...props}>
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => onDotButtonClick(index)}
            className={cn(
              'h-2 w-2 rounded-full bg-primary/20 transition-colors duration-300',
              index === selectedIndex ? 'bg-primary' : 'hover:bg-primary/50'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    );
  }
);
CarouselDots.displayName = 'CarouselDots';

const CarouselProgress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { api } = useCarousel();
    const progressRef = React.useRef<HTMLDivElement>(null);
    const animationNameRef = React.useRef('');
    const timeoutIdRef = React.useRef(0);
    const rafIdRef = React.useRef(0);

    const startProgress = React.useCallback((timeUntilNext: number | null) => {
      const node = progressRef.current;

      if (!node) return;
      if (timeUntilNext === null) return;

      if (!animationNameRef.current) {
        const style = window.getComputedStyle(node);
        animationNameRef.current = style.animationName;
      }

      // Reset the animation
      node.style.animationName = 'none';
      node.style.transform = 'translate3d(0,0,0)';

      // Use requestAnimationFrame to ensure style reset before animation
      rafIdRef.current = window.requestAnimationFrame(() => {
        timeoutIdRef.current = window.setTimeout(() => {
          if (node) {
            node.style.animationName = animationNameRef.current;
            node.style.animationDuration = `${timeUntilNext}ms`;
          }
        }, 0);
      });
    }, []);

    React.useEffect(() => {
      const autoplay = api?.plugins()?.autoplay;
      if (!autoplay) return;

      const handleTimerSet = () => {
        startProgress(autoplay.timeUntilNext());
      };

      // Add event listeners
      api.on('autoplay:timerset', handleTimerSet);

      return () => {
        api.off('autoplay:timerset', handleTimerSet);

        // Cancel any pending animations
        cancelAnimationFrame(rafIdRef.current);
        clearTimeout(timeoutIdRef.current);
      };
    }, [api, startProgress]);

    return (
      <div
        role='progressbar'
        ref={ref}
        className={cn('h-2 w-20 overflow-hidden rounded-full border bg-muted', className)}
        {...props}
      >
        <div
          ref={progressRef}
          className='left-0 top-0 h-full w-full origin-left animate-progress-bar bg-primary'
          style={{
            animationFillMode: 'forwards',
          }}
        />
      </div>
    );
  }
);
CarouselProgress.displayName = 'CarouselProgress';

export {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselProgress,
  type CarouselApi,
};
