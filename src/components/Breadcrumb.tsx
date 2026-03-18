import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const schemaItems = items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.label,
    ...(item.href ? { item: `https://tgyardcare.com${item.href}` } : {}),
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: schemaItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs mb-6" style={{ color: 'rgba(255,255,255,0.40)' }}>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span style={{ color: 'rgba(255,255,255,0.25)' }}>›</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-green-400 transition-colors duration-150"
                style={{ color: 'rgba(255,255,255,0.40)' }}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.70)' }}>{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
