import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingProps {
  text?: string;
}

export const Loading = ({ text }: LoadingProps) => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{text || t('common.loading')}</p>
      </div>
    </div>
  );
};
