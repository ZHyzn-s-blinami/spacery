import { useEffect } from 'react';

function PageTitle({ title }) {
  useEffect(() => {
    document.title = `Spacery | ${title}`;
  }, [title]);

  return null;
}

export default PageTitle;
