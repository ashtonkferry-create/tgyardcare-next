'use client';

interface BeforeAfterItem {
  combinedImage: string | { src: string };
}

interface BeforeAfterGalleryProps {
  items: BeforeAfterItem[];
}

function imgSrc(img: string | { src: string }): string {
  return typeof img === 'string' ? img : img.src;
}

export default function BeforeAfterGallery({ items }: BeforeAfterGalleryProps) {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Before & After
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {items.map((item, index) => (
            <div key={index} className="rounded-lg overflow-hidden shadow-lg">
              <img
                src={imgSrc(item.combinedImage)}
                alt={`Professional lawn care before and after transformation showing dramatic improvement in lawn quality and appearance - TotalGuard Yard Care Madison WI project ${index + 1}`}
                className="w-full h-auto"
                loading="lazy"
                width="600"
                height="400"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
