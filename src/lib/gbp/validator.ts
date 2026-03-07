import { createClient } from '@supabase/supabase-js';
import type { ContentRule, ValidationResult } from './types';

// Hardcoded baseline rules (always enforced, even if DB is empty)
const PHONE_REGEX = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/;
const URL_REGEX = /https?:\/\/|www\.|\.com\/|\.net\/|\.org\//i;
const EMAIL_REGEX = /\S+@\S+\.\S+/;
const ALL_CAPS_REGEX = /\b[A-Z]{4,}\b/;
const MAX_POST_LENGTH = 1500;
const MAX_REPLY_LENGTH = 500;
const IDEAL_POST_RANGE = { min: 80, max: 400 };
const IDEAL_REPLY_RANGE = { min: 30, max: 200 };

const HARDCODED_BLOCKED_WORDS = [
  'book now', 'call us at', 'visit our website', 'check out our',
  'use code', 'promo code', 'limited time', 'act now', 'don\'t miss',
];

const EMPATHY_WORDS = ['understand', 'sorry', 'appreciate', 'hear', 'thank', 'feedback', 'concern'];

/** Load dynamic rules from Supabase */
async function loadDynamicRules(): Promise<ContentRule[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from('gbp_content_rules')
    .select('*')
    .eq('active', true);

  return (data as ContentRule[]) || [];
}

/** Validate GBP post content */
export async function validatePostContent(text: string): Promise<ValidationResult> {
  const violations: string[] = [];

  if (text.length > MAX_POST_LENGTH) {
    violations.push(`Post exceeds ${MAX_POST_LENGTH} char limit (${text.length} chars)`);
  }
  if (text.length < IDEAL_POST_RANGE.min) {
    violations.push(`Post too short (${text.length} chars, min ${IDEAL_POST_RANGE.min})`);
  }

  if (PHONE_REGEX.test(text)) violations.push('Contains phone number — use CTA button instead');
  if (URL_REGEX.test(text)) violations.push('Contains URL — use CTA button instead');
  if (EMAIL_REGEX.test(text)) violations.push('Contains email address');
  if (ALL_CAPS_REGEX.test(text)) violations.push('Contains ALL CAPS words (looks spammy)');

  const emojiCount = (text.match(/[\u{1F300}-\u{1FAFF}]/gu) || []).length;
  if (emojiCount > 3) violations.push(`Too many emojis (${emojiCount}, max 3)`);

  const lower = text.toLowerCase();
  for (const word of HARDCODED_BLOCKED_WORDS) {
    if (lower.includes(word)) {
      violations.push(`Contains blocked phrase: "${word}"`);
    }
  }

  const rules = await loadDynamicRules();
  for (const rule of rules) {
    if (rule.rule_type === 'blocked_pattern') {
      const regex = new RegExp(rule.value, 'i');
      if (regex.test(text)) {
        violations.push(rule.reason || `Matched blocked pattern: ${rule.value}`);
      }
    }
    if (rule.rule_type === 'blocked_word' && lower.includes(rule.value.toLowerCase())) {
      violations.push(rule.reason || `Contains blocked word: "${rule.value}"`);
    }
  }

  return { valid: violations.length === 0, violations };
}

/** Validate review reply content */
export async function validateReviewReply(
  text: string,
  starRating: number
): Promise<ValidationResult> {
  const violations: string[] = [];

  if (text.length > MAX_REPLY_LENGTH) {
    violations.push(`Reply exceeds ${MAX_REPLY_LENGTH} char limit (${text.length} chars)`);
  }
  if (text.length < IDEAL_REPLY_RANGE.min) {
    violations.push(`Reply too short (${text.length} chars, min ${IDEAL_REPLY_RANGE.min})`);
  }

  if (PHONE_REGEX.test(text)) violations.push('Contains phone number');
  if (URL_REGEX.test(text)) violations.push('Contains URL');
  if (EMAIL_REGEX.test(text)) violations.push('Contains email address');

  const lower = text.toLowerCase();
  for (const word of HARDCODED_BLOCKED_WORDS) {
    if (lower.includes(word)) {
      violations.push(`Contains blocked phrase: "${word}"`);
    }
  }

  if (starRating <= 3) {
    const hasEmpathy = EMPATHY_WORDS.some((w) => lower.includes(w));
    if (!hasEmpathy) {
      violations.push('Negative review reply must contain empathy language (sorry, understand, appreciate, etc.)');
    }
  }

  const rules = await loadDynamicRules();
  for (const rule of rules) {
    if (rule.rule_type === 'blocked_pattern') {
      const regex = new RegExp(rule.value, 'i');
      if (regex.test(text)) {
        violations.push(rule.reason || `Matched blocked pattern: ${rule.value}`);
      }
    }
    if (rule.rule_type === 'blocked_word' && lower.includes(rule.value.toLowerCase())) {
      violations.push(rule.reason || `Contains blocked word: "${rule.value}"`);
    }
    if (rule.rule_type === 'required_keyword' && starRating <= 3) {
      const keywords = rule.value.split('|');
      const hasRequired = keywords.some((kw) => lower.includes(kw.trim()));
      if (!hasRequired) {
        violations.push(rule.reason || `Missing required keyword from: ${rule.value}`);
      }
    }
  }

  return { valid: violations.length === 0, violations };
}
