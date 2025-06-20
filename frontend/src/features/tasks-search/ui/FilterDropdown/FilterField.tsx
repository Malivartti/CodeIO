import DownArrowIcon from '@shared/assets/icons/DownArrow.svg';
import cn from 'classnames';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState
} from 'react';

interface Props {
  label: string;
  value: string;
  onClick: () => void;
  isOpen: boolean;
}

const FilterField = forwardRef<HTMLButtonElement, Props>(
  ({ label, value, onClick, isOpen }, externalRef) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const iconRef = useRef<SVGSVGElement>(null);
    useImperativeHandle(externalRef, () => buttonRef.current as HTMLButtonElement);

    const [hiddenCount, setHiddenCount] = useState(0);
    const tokens = value ? value.split(', ') : [];

    const calcVisibility = () => {
      if (!buttonRef.current) return;

      const containerWidth = buttonRef.current.getBoundingClientRect().width;
      const iconWidth = iconRef.current?.getBoundingClientRect().width ?? 0;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.font = getComputedStyle(buttonRef.current).font;

      const commaWidth = ctx.measureText(', ').width;
      const safetyGap = 11;

      let used = 0;
      let visible = 0;

      for (let i = 0; i < tokens.length; i += 1) {
        const wordWidth = ctx.measureText(tokens[i]).width;
        const sepWidth = i > 0 ? commaWidth : 0;

        const remain = tokens.length - (i + 1);
        const suffix = remain > 0
          ? (visible + 1 > 0 ? `, +${remain}` : `+${remain}`)
          : '';
        const suffixWidth = remain > 0 ? ctx.measureText(suffix).width : 0;

        const fits =
          used + sepWidth + wordWidth + suffixWidth + iconWidth + safetyGap
          <= containerWidth;

        if (!fits) break;

        used += sepWidth + wordWidth;
        visible += 1;
      }

      setHiddenCount(tokens.length - visible);
    };

    useLayoutEffect(calcVisibility, [value]);
    useEffect(() => {
      window.addEventListener('resize', calcVisibility);
      return () => window.removeEventListener('resize', calcVisibility);
    }, []);

    const visibleTokens = tokens.slice(0, tokens.length - hiddenCount);

    return (
      <div className="flex items-center gap-4 w-full">
        <span className="shrink-0 w-20 text-sm text-strong">{label}</span>

        <button
          ref={buttonRef}
          onClick={onClick}
          className="min-w-0 flex-1 flex items-center justify-between gap-2 px-3 py-2 border border-surface bg-canvas hover:bg-surface-hover active:bg-surface-active rounded-md  transition-colors"
        >
          <span className="flex-1 min-w-0 flex items-center gap-1 overflow-hidden">
            {tokens.length === 0 ? (
              <span className="text-sm text-subtle">Не выбрано</span>
            ) : (
              <>
                {visibleTokens.map((t, i) => (
                  <span
                    key={t}
                    className="text-sm text-medium whitespace-nowrap"
                  >
                    {t}
                    {i < visibleTokens.length - 1 && ','}
                  </span>
                ))}
                {hiddenCount > 0 && (
                  <span className="text-sm text-medium whitespace-nowrap">
                    {visibleTokens.length > 0 ? ', ' : ''}
                    +{hiddenCount}
                  </span>
                )}
              </>
            )}
          </span>

          <DownArrowIcon
            ref={iconRef}
            className={cn(
              'flex-shrink-0 h-4 w-4 text-subtle transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            width={16}
            height={16}
          />
        </button>
      </div>
    );
  }
);

FilterField.displayName = 'FilterField';
export default FilterField;
