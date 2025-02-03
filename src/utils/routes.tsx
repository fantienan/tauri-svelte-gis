import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';

export const NoMatch = () => <div>404</div>;

export const RootErrorBoundary = () => {
  const error = useRouteError() as Error;

  useEffect(() => {
    console.warn(error);
  }, [error]);

  return (
    <div>
      <div>报错了</div>
      <p>控制台中查看详细报错信息。</p>
    </div>
  );
};
