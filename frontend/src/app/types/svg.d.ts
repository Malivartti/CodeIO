declare module '*.svg' {
  import * as React from 'react';
  const Component: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }>;
  export default Component;
}

declare module '*.svg?url' {
  const content: string;
  export default content;
}
