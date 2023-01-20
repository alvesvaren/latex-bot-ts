declare module 'mathjax' {
  import * as MathJax from 'mathjax';
  export function init(options: any): Promise<{
    tex2svgPromise: (
      tex: string,
      options: { display?: boolean },
    ) => Promise<any>;
  }>;
}

declare namespace MathJax {
  const startup: {
    adaptor: {
      innerHTML: (node: any) => string;
    };
  };
}
