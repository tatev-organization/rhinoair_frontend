import React from 'react';
import Calculator from '@/components/calculator/Calculator';

export default async function CalculatorPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const unwrappedSearchParams = await searchParams;
  const projectId = unwrappedSearchParams.projectId as string | undefined;
  const quoteId = unwrappedSearchParams.quoteId as string | undefined;
  return <Calculator projectId={projectId} quoteId={quoteId} />;
}
