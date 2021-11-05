import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import NProgress from 'nprogress';

interface NProgressState {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function useNProgress(): NProgressState {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) {
      NProgress.done();
    } else {
      NProgress.start();
    }
  }, [loading]);
  return useMemo(() => ({ loading, setLoading }), [loading, setLoading]);
}
