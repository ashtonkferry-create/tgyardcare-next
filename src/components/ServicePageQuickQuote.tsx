'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ServicePageQuickQuoteProps {
  serviceName: string;
  serviceSlug: string;
}

interface FormFields {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  form?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateFields(fields: FormFields): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.name.trim() || fields.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!fields.email.trim() || !EMAIL_REGEX.test(fields.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  const digitsOnly = fields.phone.replace(/\D/g, '');
  if (!fields.phone.trim() || digitsOnly.length < 10) {
    errors.phone = 'Phone number must be at least 10 digits';
  }

  if (!fields.address.trim() || fields.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters';
  }

  return errors;
}

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '12px',
  color: 'white',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.2s ease',
};

function Field({
  label,
  id,
  type = 'text',
  value,
  placeholder,
  error,
  onChange,
}: {
  label: string;
  id: keyof FormFields;
  type?: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? 'rgba(248,113,113,0.40)'
    : focused
    ? 'rgba(245,158,11,0.40)'
    : 'rgba(255,255,255,0.10)';

  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.65)',
          marginBottom: '6px',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        required
        autoComplete={
          id === 'name'
            ? 'name'
            : id === 'email'
            ? 'email'
            : id === 'phone'
            ? 'tel'
            : 'street-address'
        }
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputBase, borderColor }}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p
          id={`${id}-error`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '6px',
            fontSize: '12px',
            color: '#f87171',
          }}
        >
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

export default function ServicePageQuickQuote({
  serviceName,
  serviceSlug,
}: ServicePageQuickQuoteProps) {
  const [fields, setFields] = useState<FormFields>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FieldErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FieldErrors];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateFields(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const message = `I'm interested in ${serviceName} service.`;

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim().toLowerCase(),
          phone: fields.phone.trim(),
          address: fields.address.trim(),
          message,
          service: serviceSlug,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          (json as { error?: string })?.error ?? `Server error (${res.status})`
        );
      }

      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit form. Please try again.';
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      style={{ background: '#050d07', paddingTop: '40px', paddingBottom: '56px' }}
      className="py-10 md:py-14"
    >
      <div className="container mx-auto px-4">
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '16px',
                  padding: '40px 32px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(16,185,129,0.15)',
                    marginBottom: '16px',
                  }}
                >
                  <CheckCircle size={28} color="#10b981" />
                </div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'white',
                    marginBottom: '10px',
                  }}
                >
                  Quote Request Received
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                  Our team will reach out to discuss your property and get you scheduled — typically
                  within the same business day.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '32px',
                }}
                className="md:p-8"
              >
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                  <h2
                    style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      color: 'white',
                      marginBottom: '6px',
                    }}
                    className="text-xl md:text-2xl font-bold"
                  >
                    Get Your {serviceName} Quote
                  </h2>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                    We'll reach out to discuss your property and get you scheduled.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Field
                      label="Full Name"
                      id="name"
                      type="text"
                      value={fields.name}
                      placeholder="John Smith"
                      error={errors.name}
                      onChange={handleChange}
                    />
                    <Field
                      label="Email Address"
                      id="email"
                      type="email"
                      value={fields.email}
                      placeholder="john@example.com"
                      error={errors.email}
                      onChange={handleChange}
                    />
                    <Field
                      label="Phone Number"
                      id="phone"
                      type="tel"
                      value={fields.phone}
                      placeholder="(608) 555-1234"
                      error={errors.phone}
                      onChange={handleChange}
                    />
                    <Field
                      label="Property Address"
                      id="address"
                      type="text"
                      value={fields.address}
                      placeholder="123 Main St, Madison, WI 53703"
                      error={errors.address}
                      onChange={handleChange}
                    />

                    {/* Form-level error */}
                    {errors.form && (
                      <p
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 14px',
                          background: 'rgba(248,113,113,0.08)',
                          border: '1px solid rgba(248,113,113,0.25)',
                          borderRadius: '10px',
                          fontSize: '13px',
                          color: '#f87171',
                        }}
                      >
                        <AlertCircle size={14} />
                        {errors.form}
                      </p>
                    )}

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={isSubmitting ? {} : { scale: 1.02 }}
                      whileTap={isSubmitting ? {} : { scale: 0.98 }}
                      style={{
                        width: '100%',
                        padding: '14px 24px',
                        borderRadius: '12px',
                        background: isSubmitting
                          ? 'rgba(245,158,11,0.5)'
                          : 'linear-gradient(135deg, #f59e0b, #d97706)',
                        border: 'none',
                        color: 'black',
                        fontWeight: 700,
                        fontSize: '15px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'box-shadow 0.2s ease',
                        marginTop: '4px',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting) {
                          (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            '0 0 24px rgba(245,158,11,0.30)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                          Sending Request…
                        </>
                      ) : (
                        'Request My Free Quote'
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
