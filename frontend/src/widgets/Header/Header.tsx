import { observer } from 'mobx-react-lite';
import { FC } from 'react';

import HeaderDesktop from './components/HeaderDesktop';
import HeaderMobile from './components/HeaderMobile';
import { useMediaQuery } from './hooks/useMediaQuery';

const Header: FC = observer(() => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return isDesktop ? <HeaderDesktop /> : <HeaderMobile />;
});

export default Header;
