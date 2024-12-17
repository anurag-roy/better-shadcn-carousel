'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselProgress,
} from '@/components/ui/carousel';

export function CarouselDemo() {
  return (
    <Carousel className='w-full max-w-2xl' opts={{ loop: true }} autoplay={{ delay: 3000, stopOnInteraction: false }}>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className='p-1'>
              <Card>
                <CardContent className='flex aspect-video items-center justify-center p-6'>
                  <span className='text-4xl font-semibold'>{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className='flex items-center justify-between gap-4 px-1 py-2'>
        <div className='flex items-center gap-4'>
          <CarouselPrevious />
          <CarouselNext />
        </div>
        <CarouselDots />
        <CarouselProgress />
      </div>
    </Carousel>
  );
}
