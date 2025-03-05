interface PageTitleProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageTitle = ({ title, subtitle, actions }: PageTitleProps) => {
  return (
    <div className="md:flex md:items-center md:justify-between mb-8">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="mt-4 flex md:ml-4 md:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageTitle; 