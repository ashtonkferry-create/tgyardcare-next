'use client';

const KEYWORD_MAP: Record<string, string> = {
  'lawn mowing': '/services/mowing',
  'lawn care': '/services/mowing',
  'gutter cleaning': '/services/gutter-cleaning',
  'gutter guards': '/services/gutter-guards',
  'snow removal': '/services/snow-removal',
  'fertilization': '/services/fertilization',
  'fall cleanup': '/services/fall-cleanup',
  'spring cleanup': '/services/spring-cleanup',
  'hardscaping': '/services/hardscaping',
};

interface InlineServiceLinksProps {
  content: string;
}

function injectLinks(html: string): string {
  let result = html;
  const usedKeywords = new Set<string>();
  for (const [keyword, href] of Object.entries(KEYWORD_MAP)) {
    if (usedKeywords.has(keyword)) continue;
    const regex = new RegExp(`(?<!<[^>]*)(${keyword})(?![^<]*>)`, 'i');
    if (regex.test(result)) {
      result = result.replace(
        regex,
        `<a href="${href}" class="text-green-400 hover:text-green-300 underline underline-offset-2">${keyword}</a>`
      );
      usedKeywords.add(keyword);
    }
  }
  return result;
}

export default function InlineServiceLinks({ content }: InlineServiceLinksProps) {
  const processed = injectLinks(content);
  return <div dangerouslySetInnerHTML={{ __html: processed }} />;
}
