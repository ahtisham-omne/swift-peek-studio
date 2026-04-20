import clsx from "clsx";
import svgPaths from "./svg-3vqksetu7b";
type Wrapper12Props = {
  additionalClassNames?: string;
};

function Wrapper12({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper12Props>) {
  return (
    <div className={clsx("size-[12px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        {children}
      </svg>
    </div>
  );
}
type Wrapper11Props = {
  additionalClassNames?: string;
};

function Wrapper11({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper11Props>) {
  return (
    <div className={additionalClassNames}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">{children}</div>
    </div>
  );
}
type Wrapper10Props = {
  additionalClassNames?: string;
};

function Wrapper10({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper10Props>) {
  return <Wrapper11 additionalClassNames={clsx("flex-[1_0_0] min-h-px min-w-px relative", additionalClassNames)}>{children}</Wrapper11>;
}
type Wrapper9Props = {
  additionalClassNames?: string;
};

function Wrapper9({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper9Props>) {
  return <Wrapper11 additionalClassNames={clsx("h-[36px] relative shrink-0", additionalClassNames)}>{children}</Wrapper11>;
}
type Container2Props = {
  additionalClassNames?: string;
};

function Container2({ children, additionalClassNames = "" }: React.PropsWithChildren<Container2Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">{children}</div>
    </div>
  );
}

function Wrapper8({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px] w-[40px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">{children}</div>
    </div>
  );
}
type Wrapper7Props = {
  additionalClassNames?: string;
};

function Wrapper7({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper7Props>) {
  return (
    <div className={clsx("relative rounded-[8px] shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">{children}</div>
    </div>
  );
}

function Wrapper6({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute h-[19.5px] left-[15px] top-[53px] w-[297px]">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-0 not-italic text-foreground text-[13px] top-px whitespace-nowrap">{children}</p>
    </div>
  );
}
type Wrapper5Props = {
  additionalClassNames?: string;
};

function Wrapper5({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper5Props>) {
  return (
    <div className={additionalClassNames}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type Wrapper4Props = {
  additionalClassNames?: string;
};

function Wrapper4({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper4Props>) {
  return <Wrapper5 additionalClassNames={clsx("flex-[1_0_0] min-h-px min-w-px relative", additionalClassNames)}>{children}</Wrapper5>;
}
type Wrapper3Props = {
  additionalClassNames?: string;
};

function Wrapper3({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper3Props>) {
  return <Wrapper5 additionalClassNames={clsx("relative shrink-0", additionalClassNames)}>{children}</Wrapper5>;
}
type Wrapper2Props = {
  additionalClassNames?: string;
};

function Wrapper2({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper2Props>) {
  return (
    <div className={clsx("size-[16px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        {children}
      </svg>
    </div>
  );
}

function Wrapper1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[18px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        {children}
      </svg>
    </div>
  );
}

function Container1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[40.5px] relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-border border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center pb-px px-[14px] relative size-full">{children}</div>
      </div>
    </div>
  );
}
type ButtonProps = {
  additionalClassNames?: string;
};

function Button({ children, additionalClassNames = "" }: React.PropsWithChildren<ButtonProps>) {
  return (
    <div className={clsx("bg-white justify-self-stretch relative rounded-[12px] self-stretch shrink-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[15px] pr-px py-px relative size-full">{children}</div>
      </div>
    </div>
  );
}

function Icon1({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper1>
      <g id="Icon">{children}</g>
    </Wrapper1>
  );
}

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper2 additionalClassNames="relative shrink-0">
      <g id="Icon">{children}</g>
    </Wrapper2>
  );
}
type SpanText1Props = {
  text: string;
  additionalClassNames?: string;
};

function SpanText1({ text, additionalClassNames = "" }: SpanText1Props) {
  return (
    <Wrapper5 additionalClassNames={clsx("h-[16.5px] relative shrink-0", additionalClassNames)}>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-muted-foreground text-[11px] top-[0.5px] whitespace-nowrap">{text}</p>
    </Wrapper5>
  );
}
type SpanTextProps = {
  text: string;
};

function SpanText({ text }: SpanTextProps) {
  return (
    <div className="flex-[1_0_0] h-[19.5px] min-h-px min-w-px relative">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-foreground text-[13px] top-px whitespace-nowrap">{text}</p>
      </div>
    </div>
  );
}
type PText1Props = {
  text: string;
};

function PText1({ text }: PText1Props) {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] left-0 not-italic text-muted-foreground text-[11px] top-[0.5px] whitespace-nowrap">{text}</p>
    </div>
  );
}

function Icon() {
  return (
    <Wrapper>
      <path d={svgPaths.p19d57600} id="Vector" stroke="var(--stroke-0, #EA580C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M2 6H14" id="Vector_2" stroke="var(--stroke-0, #EA580C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M2 10H14" id="Vector_3" stroke="var(--stroke-0, #EA580C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M6 2V14" id="Vector_4" stroke="var(--stroke-0, #EA580C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M10 2V14" id="Vector_5" stroke="var(--stroke-0, #EA580C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Wrapper>
  );
}
type PTextProps = {
  text: string;
};

function PText({ text }: PTextProps) {
  return (
    <div className="absolute h-[17.875px] left-[15px] top-[74.5px] w-[297px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[17.875px] left-0 not-italic text-muted-foreground text-[11px] top-0 whitespace-nowrap">{text}</p>
    </div>
  );
}
type Text2Props = {
  text: string;
};

function Text2({ text }: Text2Props) {
  return (
    <div className="h-[20px] relative shrink-0 w-full">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-muted-foreground text-[14px] top-[0.5px] tracking-[-0.14px] whitespace-nowrap">{text}</p>
    </div>
  );
}
type Text1Props = {
  text: string;
};

function Text1({ text }: Text1Props) {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-0 not-italic text-foreground text-[13px] top-px whitespace-nowrap">{text}</p>
    </div>
  );
}
type TextProps = {
  text: string;
};

function Text({ text }: TextProps) {
  return <Wrapper6>{text}</Wrapper6>;
}
type ContainerProps = {
  additionalClassNames?: string;
};

function Container({ additionalClassNames = "" }: ContainerProps) {
  return (
    <div className={clsx("bg-accent relative rounded-[16777200px] shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Wrapper3 additionalClassNames="h-[16.5px] w-[16.172px]">
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16.5px] left-0 not-italic text-primary text-[11px] top-[0.5px] whitespace-nowrap">{"AA"}</p>
        </Wrapper3>
      </div>
    </div>
  );
}

export default function VendorWidgetTest() {
  return (
    <div className="bg-[#f7f8fa] relative size-full" data-name="Vendor - Widget test">
      <div className="absolute h-[862px] left-[1109px] top-0 w-0" data-name="Section" />
      <div className="absolute bg-white content-stretch flex flex-col h-[862px] items-center left-0 pr-px top-0 w-[60px]" data-name="aside">
        <div aria-hidden="true" className="absolute border-border border-r border-solid inset-0 pointer-events-none" />
        <div className="h-[48px] relative shrink-0 w-[59px]" data-name="div">
          <div aria-hidden="true" className="absolute border-border border-b border-solid inset-0 pointer-events-none" />
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pb-px relative size-full">
            <div className="bg-primary relative rounded-[8px] shrink-0 size-[36px]" data-name="button">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.008px] relative size-full">
                <Wrapper3 additionalClassNames="h-[20px] w-[10.508px]">
                  <p className="-translate-x-1/2 absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-[5.5px] not-italic text-[14px] text-center text-white top-[0.5px] tracking-[-0.28px] whitespace-nowrap">O</p>
                </Wrapper3>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-[1_0_0] min-h-px min-w-px relative w-[59px]" data-name="nav">
          <div className="overflow-clip rounded-[inherit] size-full">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[12px] relative size-full">
              <div className="content-stretch flex flex-col gap-[2px] h-[334px] items-center relative shrink-0 w-full" data-name="div">
                <Wrapper7 additionalClassNames="size-[40px]">
                  <Icon1>
                    <path d={svgPaths.p1bd4a900} id="Vector" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M5.25 12.375L1.695 10.2375" id="Vector_2" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M5.25 12.375L9 10.125" id="Vector_3" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M5.25 12.375V16.2525" id="Vector_4" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d={svgPaths.p34ca0b00} id="Vector_5" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M12.75 12.375L9 10.125" id="Vector_6" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M12.75 12.375L16.305 10.2375" id="Vector_7" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M12.75 12.375V16.2525" id="Vector_8" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d={svgPaths.p1aa018e7} id="Vector_9" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M9 6L5.445 3.8625" id="Vector_10" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M9 6L12.555 3.8625" id="Vector_11" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M9 10.125V6" id="Vector_12" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                  </Icon1>
                </Wrapper7>
                <Wrapper7 additionalClassNames="bg-[rgba(10,119,255,0.06)] size-[40px]">
                  <Icon1>
                    <path d={svgPaths.p3a657980} id="Vector" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    <path d={svgPaths.p3d7fc0f0} id="Vector_2" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    <path d="M15.75 2.25L16.5 10.5H15" id="Vector_3" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    <path d={svgPaths.p2d9ca780} id="Vector_4" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    <path d="M2.25 3H8.25" id="Vector_5" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </Icon1>
                </Wrapper7>
                <Wrapper7 additionalClassNames="size-[40px]">
                  <Icon1>
                    <path d={svgPaths.pb9add80} id="Vector" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M11.25 13.5H6.75" id="Vector_2" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d={svgPaths.p27fe380} id="Vector_3" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d={svgPaths.pa40c600} id="Vector_4" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d={svgPaths.p20a8dc00} id="Vector_5" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                  </Icon1>
                </Wrapper7>
                <Wrapper7 additionalClassNames="size-[40px]">
                  <Wrapper1>
                    <g clipPath="url(#clip0_4098_2265)" id="Icon">
                      <path d={svgPaths.pbd74680} id="Vector" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                      <path d="M12.75 13.5H13.5" id="Vector_2" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                      <path d="M9 13.5H9.75" id="Vector_3" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                      <path d="M5.25 13.5H6" id="Vector_4" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    </g>
                    <defs>
                      <clipPath id="clip0_4098_2265">
                        <rect fill="white" height="18" width="18" />
                      </clipPath>
                    </defs>
                  </Wrapper1>
                </Wrapper7>
                <Wrapper7 additionalClassNames="size-[40px]">
                  <Wrapper1>
                    <g clipPath="url(#clip0_4098_2250)" id="Icon">
                      <path d={svgPaths.p61f9880} id="Vector" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                      <path d={svgPaths.p266da370} id="Vector_2" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                      <path d={svgPaths.p12d64e80} id="Vector_3" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    </g>
                    <defs>
                      <clipPath id="clip0_4098_2250">
                        <rect fill="white" height="18" width="18" />
                      </clipPath>
                    </defs>
                  </Wrapper1>
                </Wrapper7>
                <Wrapper7 additionalClassNames="size-[40px]">
                  <Icon1>
                    <path d={svgPaths.p9c0d800} id="Vector" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M6 4.5H12" id="Vector_2" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M12 10.5V13.5" id="Vector_3" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M12 7.5H12.0075" id="Vector_4" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M9 7.5H9.0075" id="Vector_5" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M6 7.5H6.0075" id="Vector_6" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M9 10.5H9.0075" id="Vector_7" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M6 10.5H6.0075" id="Vector_8" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M9 13.5H9.0075" id="Vector_9" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d="M6 13.5H6.0075" id="Vector_10" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                  </Icon1>
                </Wrapper7>
                <Wrapper7 additionalClassNames="size-[40px]">
                  <Icon1>
                    <path d={svgPaths.pcef68c0} id="Vector" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d={svgPaths.p39d6d500} id="Vector_2" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    <path d={svgPaths.p36535880} id="Vector_3" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                  </Icon1>
                </Wrapper7>
                <Wrapper8>
                  <Wrapper1>
                    <g clipPath="url(#clip0_4098_2230)" id="Icon">
                      <path d={svgPaths.p3cb50b00} id="Vector" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                      <path d={svgPaths.p3f23a000} id="Vector_2" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                      <path d={svgPaths.p1f67c900} id="Vector_3" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                      <path d="M7.5 4.5H10.5" id="Vector_4" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                      <path d="M7.5 7.5H10.5" id="Vector_5" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                      <path d="M7.5 10.5H10.5" id="Vector_6" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                      <path d="M7.5 13.5H10.5" id="Vector_7" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
                    </g>
                    <defs>
                      <clipPath id="clip0_4098_2230">
                        <rect fill="white" height="18" width="18" />
                      </clipPath>
                    </defs>
                  </Wrapper1>
                </Wrapper8>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[151px] relative shrink-0 w-[59px]" data-name="div">
          <div aria-hidden="true" className="absolute border-border border-solid border-t inset-0 pointer-events-none" />
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-px relative size-full">
            <div className="content-stretch flex flex-col gap-[2px] h-[98px] items-center py-[8px] relative shrink-0 w-full" data-name="Container">
              <Wrapper7 additionalClassNames="size-[40px]">
                <Wrapper2 additionalClassNames="relative shrink-0">
                  <g id="Settings">
                    <path d={svgPaths.p2338cf00} id="Vector" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p28db2b80} id="Vector_2" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </g>
                </Wrapper2>
              </Wrapper7>
              <Wrapper8>
                <Wrapper2 additionalClassNames="relative shrink-0">
                  <g id="Bell">
                    <path d={svgPaths.p1ce3c700} id="Vector" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p1a06de00} id="Vector_2" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </g>
                </Wrapper2>
              </Wrapper8>
            </div>
            <div className="content-stretch flex h-[52px] items-start justify-center relative shrink-0 w-full" data-name="Container">
              <Container additionalClassNames="size-[40px]" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col h-[862px] items-start left-[60px] overflow-clip top-0 w-[1049px]" data-name="main">
        <Wrapper10 additionalClassNames="w-[1049px]">
          <div className="bg-white h-[48px] relative shrink-0 w-[1049px]" data-name="Container">
            <div aria-hidden="true" className="absolute border-border border-b border-solid inset-0 pointer-events-none" />
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-px px-[24px] relative size-full">
              <Container2 additionalClassNames="h-[19.5px] w-[137.844px]">
                <Wrapper4 additionalClassNames="h-[19.5px]">
                  <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-0 not-italic text-foreground text-[13px] top-px whitespace-nowrap">Partners Management</p>
                </Wrapper4>
              </Container2>
              <Wrapper3 additionalClassNames="h-[36px] w-[401.961px]">
                <div className="absolute bg-[#f7f8fa] content-stretch flex items-center justify-center left-0 p-px rounded-[6px] size-[32px] top-[2px]" data-name="Button">
                  <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[6px]" />
                  <Wrapper2 additionalClassNames="relative shrink-0">
                    <g id="Plus">
                      <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #0F172A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                      <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, #0F172A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    </g>
                  </Wrapper2>
                </div>
                <div className="absolute content-stretch flex gap-[8px] h-[33.25px] items-center left-[256px] top-[1.38px] w-[145.961px]" data-name="Container">
                  <Container additionalClassNames="size-[32px]" />
                  <Wrapper10 additionalClassNames="h-[33.25px]">
                    <Text1 text="Ahtisham Ahmad" />
                    <div className="content-stretch flex h-[13.75px] items-start relative shrink-0 w-full" data-name="p">
                      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[13.75px] min-h-px min-w-px not-italic relative text-muted-foreground text-[11px]">Product Designer</p>
                    </div>
                  </Wrapper10>
                </div>
                <div className="absolute h-[36px] left-[44px] top-0 w-[200px]" data-name="Container">
                  <div className="absolute bg-slate-50 h-[36px] left-0 rounded-[6px] top-0 w-[200px]" data-name="Input">
                    <div className="content-stretch flex items-center overflow-clip pl-[36px] pr-[12px] py-[4px] relative rounded-[inherit] size-full">
                      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-muted-foreground text-[14px] whitespace-nowrap">Search</p>
                    </div>
                    <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[6px]" />
                  </div>
                  <Wrapper2 additionalClassNames="absolute left-[12px] top-[10px]">
                    <g id="Search">
                      <path d={svgPaths.p107a080} id="Vector" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                      <path d="M14 14L11.1333 11.1333" id="Vector_2" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    </g>
                  </Wrapper2>
                </div>
              </Wrapper3>
            </div>
          </div>
          <div className="flex-[1_0_0] min-h-px min-w-px relative w-[1049px]" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
              <div className="h-[721.625px] relative shrink-0 w-full" data-name="Container">
                <div className="absolute content-stretch flex flex-col gap-[2px] h-[54px] items-start left-[24px] top-[16px] w-[1001px]" data-name="Container">
                  <div className="content-stretch flex h-[32px] items-center justify-between relative shrink-0 w-full" data-name="Container">
                    <Wrapper3 additionalClassNames="h-[32px] w-[242.172px]">
                      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-0 not-italic text-foreground text-[24px] top-[-1px] tracking-[-0.6px] whitespace-nowrap">Partners Management</p>
                    </Wrapper3>
                    <Container2 additionalClassNames="h-[30px] w-[72.25px]">
                      <div className="flex-[1_0_0] h-[30px] min-h-px min-w-px relative rounded-[8px]" data-name="button">
                        <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[8px]" />
                        <div className="flex flex-row items-center size-full">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center px-[11px] py-px relative size-full">
                            <Wrapper12 additionalClassNames="relative shrink-0">
                              <g id="RotateCcw">
                                <path d={svgPaths.p3892d900} id="Vector" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M1.5 1.5V4H4" id="Vector_2" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" />
                              </g>
                            </Wrapper12>
                            <Wrapper4 additionalClassNames="h-[16px]">
                              <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[16.5px] not-italic text-muted-foreground text-[12px] text-center top-[0.5px] whitespace-nowrap">Reset</p>
                            </Wrapper4>
                          </div>
                        </div>
                      </div>
                    </Container2>
                  </div>
                  <div className="h-[20px] relative shrink-0 w-full" data-name="p">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-muted-foreground text-[14px] top-[0.5px] whitespace-nowrap">{`Manage your vendors, customers, and partner operations. `}</p>
                    <div className="absolute h-[20px] left-[389.17px] top-0 w-[92.227px]" data-name="button">
                      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[38px] not-italic text-primary text-[14px] text-center top-[0.5px] whitespace-nowrap">Learn more</p>
                      <Wrapper12 additionalClassNames="absolute left-[80.23px] top-[4px]">
                        <g id="ExternalLink">
                          <path d="M7.5 1.5H10.5V4.5" id="Vector" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M5 7L10.5 1.5" id="Vector_2" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" />
                          <path d={svgPaths.pc1a2200} id="Vector_3" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                      </Wrapper12>
                    </div>
                  </div>
                </div>
                <div className="absolute content-stretch flex flex-col gap-[10px] h-[366.125px] items-start left-[24px] top-[86px] w-[1001px]" data-name="Container">
                  <Text2 text="Modules" />
                  <div className="gap-x-[10px] gap-y-[10px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[repeat(3,minmax(0,1fr))] h-[336.125px] relative shrink-0 w-full" data-name="Container">
                    <div className="bg-white col-1 justify-self-stretch relative rounded-[12px] row-1 self-stretch shrink-0" data-name="Container">
                      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[12px]" />
                      <div className="absolute bg-accent content-stretch flex items-center justify-center left-[15px] rounded-[8px] size-[32px] top-[13px]" data-name="Container">
                        <Wrapper>
                          <path d={svgPaths.p32887f80} id="Vector" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d={svgPaths.p3694d280} id="Vector_2" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d={svgPaths.p1f197700} id="Vector_3" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d={svgPaths.p3bf3e100} id="Vector_4" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                        </Wrapper>
                      </div>
                      <Text text="Partners" />
                      <PText text="Manage vendors, customers, and partner details." />
                    </div>
                    <div className="bg-white col-2 justify-self-stretch relative rounded-[12px] row-1 self-stretch shrink-0" data-name="Container">
                      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[12px]" />
                      <div className="absolute bg-[#fff7ed] content-stretch flex items-center justify-center left-[15px] rounded-[8px] size-[32px] top-[13px]" data-name="Container">
                        <Icon />
                      </div>
                      <Text text="Partner Groups" />
                      <PText text="Organize partners into groups and classes." />
                    </div>
                    <div className="bg-white col-3 justify-self-stretch relative rounded-[12px] row-1 self-stretch shrink-0" data-name="Container">
                      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[12px]" />
                      <div className="absolute bg-violet-50 content-stretch flex items-center justify-center left-[15px] rounded-[8px] size-[32px] top-[13px]" data-name="Container">
                        <Wrapper>
                          <path d="M10.6667 1.33333V2.66667" id="Vector" stroke="var(--stroke-0, #7C3AED)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d={svgPaths.p15fc5300} id="Vector_2" stroke="var(--stroke-0, #7C3AED)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d="M5.33333 1.33333V2.66667" id="Vector_3" stroke="var(--stroke-0, #7C3AED)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d={svgPaths.p31eda5f0} id="Vector_4" stroke="var(--stroke-0, #7C3AED)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d={svgPaths.p3ee34580} id="Vector_5" stroke="var(--stroke-0, #7C3AED)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                        </Wrapper>
                      </div>
                      <Text text="Contacts Directory" />
                      <PText text="Browse contacts across all organizations." />
                    </div>
                    <div className="bg-white col-1 justify-self-stretch relative rounded-[12px] row-2 self-stretch shrink-0" data-name="Container">
                      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[12px]" />
                      <div className="absolute bg-emerald-50 content-stretch flex items-center justify-center left-[15px] rounded-[8px] size-[32px] top-[13px]" data-name="Container">
                        <Wrapper>
                          <path d={svgPaths.p35993080} id="Vector" stroke="var(--stroke-0, #059669)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d="M1.33333 6.66667H14.6667" id="Vector_2" stroke="var(--stroke-0, #059669)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                        </Wrapper>
                      </div>
                      <Text text="Credit Management" />
                      <PText text="Monitor credit limits and balance usage." />
                    </div>
                    <div className="bg-white col-2 justify-self-stretch relative rounded-[12px] row-2 self-stretch shrink-0" data-name="Container">
                      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[12px]" />
                      <div className="absolute bg-[#ecfeff] content-stretch flex items-center justify-center left-[15px] rounded-[8px] size-[32px] top-[13px]" data-name="Container">
                        <Wrapper>
                          <path d={svgPaths.p264a0480} id="Vector" stroke="var(--stroke-0, #0891B2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d="M10 12H6" id="Vector_2" stroke="var(--stroke-0, #0891B2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d={svgPaths.p37bb0d00} id="Vector_3" stroke="var(--stroke-0, #0891B2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d={svgPaths.p1c171d80} id="Vector_4" stroke="var(--stroke-0, #0891B2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d={svgPaths.p48c6d00} id="Vector_5" stroke="var(--stroke-0, #0891B2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                        </Wrapper>
                      </div>
                      <Text text="Carrier Management" />
                      <PText text="Configure carriers and shipping methods." />
                    </div>
                    <div className="bg-white col-3 justify-self-stretch relative rounded-[12px] row-2 self-stretch shrink-0" data-name="Container">
                      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[12px]" />
                      <div className="absolute bg-[#fff1f2] content-stretch flex items-center justify-center left-[15px] rounded-[8px] size-[32px] top-[13px]" data-name="Container">
                        <Wrapper>
                          <path d={svgPaths.p14548f00} id="Vector" stroke="var(--stroke-0, #E11D48)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d={svgPaths.p17781bc0} id="Vector_2" stroke="var(--stroke-0, #E11D48)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                        </Wrapper>
                      </div>
                      <Text text="Partner Locations" />
                      <PText text="Manage locations, warehouses, and sites." />
                    </div>
                    <div className="bg-white col-1 justify-self-stretch relative rounded-[12px] row-3 self-stretch shrink-0" data-name="Container">
                      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[12px]" />
                      <div className="absolute bg-emerald-50 content-stretch flex items-center justify-center left-[15px] rounded-[8px] size-[32px] top-[13px]" data-name="Container">
                        <Wrapper>
                          <path d={svgPaths.p37f49070} id="Vector" stroke="var(--stroke-0, #059669)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d={svgPaths.p17134c00} id="Vector_2" stroke="var(--stroke-0, #059669)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                        </Wrapper>
                      </div>
                      <Text text="Qualified Vendors" />
                      <PText text="Track approved vendors and lead times." />
                    </div>
                    <div className="bg-white col-2 justify-self-stretch relative rounded-[12px] row-3 self-stretch shrink-0" data-name="Container">
                      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[12px]" />
                      <div className="absolute bg-accent content-stretch flex items-center justify-center left-[15px] rounded-[8px] size-[32px] top-[13px]" data-name="Container">
                        <Wrapper>
                          <path d={svgPaths.pea6a680} id="Vector" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          <path d={svgPaths.p3155f180} id="Vector_2" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                        </Wrapper>
                      </div>
                      <Wrapper6>{`Reports & Analytics`}</Wrapper6>
                      <PText text="View performance metrics and insights." />
                    </div>
                  </div>
                </div>
                <div className="absolute h-[233.5px] left-[24px] top-[472.13px] w-[1001px]" data-name="Container">
                  <div className="absolute content-stretch flex flex-col gap-[10px] h-[233.5px] items-start left-0 top-0 w-[664px]" data-name="Container">
                    <Text2 text="Recommended Actions" />
                    <div className="gap-x-[10px] gap-y-[10px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[repeat(2,minmax(0,1fr))] h-[134px] relative shrink-0 w-full" data-name="Container">
                      <Button additionalClassNames="col-1 row-1">
                        <Wrapper7 additionalClassNames="bg-accent size-[32px]">
                          <Wrapper>
                            <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                            <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, #0A77FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          </Wrapper>
                        </Wrapper7>
                        <Wrapper9 additionalClassNames="w-[178.023px]">
                          <Text1 text="Add New Partner" />
                          <PText1 text="Create a new vendor or customer." />
                        </Wrapper9>
                      </Button>
                      <Button additionalClassNames="col-2 opacity-60 row-1">
                        <Wrapper7 additionalClassNames="bg-violet-50 size-[32px]">
                          <Wrapper>
                            <path d={svgPaths.p23ad1400} id="Vector" stroke="var(--stroke-0, #7C3AED)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                            <path d={svgPaths.p26e09a00} id="Vector_2" stroke="var(--stroke-0, #7C3AED)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                            <path d="M8 2V10" id="Vector_3" stroke="var(--stroke-0, #7C3AED)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                          </Wrapper>
                        </Wrapper7>
                        <Wrapper9 additionalClassNames="w-[168.469px]">
                          <Text1 text="Import Partners" />
                          <PText1 text="Bulk import from a spreadsheet." />
                        </Wrapper9>
                      </Button>
                      <Button additionalClassNames="col-1 row-2">
                        <Wrapper7 additionalClassNames="bg-[#fff7ed] size-[32px]">
                          <Icon />
                        </Wrapper7>
                        <Wrapper9 additionalClassNames="w-[162.766px]">
                          <Text1 text="Create Partner Group" />
                          <PText1 text="Set up a new partner grouping." />
                        </Wrapper9>
                      </Button>
                    </div>
                  </div>
                  <div className="absolute content-stretch flex flex-col gap-[10px] h-[233.5px] items-start left-[674px] top-0 w-[327px]" data-name="Container">
                    <div className="content-stretch flex h-[20px] items-center justify-between relative shrink-0 w-full" data-name="Container">
                      <Wrapper3 additionalClassNames="h-[20px] w-[99.07px]">
                        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-muted-foreground text-[14px] top-[0.5px] tracking-[-0.14px] whitespace-nowrap">Recent Activity</p>
                      </Wrapper3>
                      <Wrapper3 additionalClassNames="h-[16px] w-[60.891px]">
                        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[30.5px] not-italic text-primary text-[12px] text-center top-[0.5px] whitespace-nowrap">View more</p>
                      </Wrapper3>
                    </div>
                    <div className="bg-white h-[203.5px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
                      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[12px]" />
                      <div className="content-stretch flex flex-col items-start p-px relative size-full">
                        <Container1>
                          <div className="bg-primary rounded-[16777200px] shrink-0 size-[6px]" data-name="span" />
                          <SpanText text="New Partner: Toyota International" />
                          <SpanText1 text="2h ago" additionalClassNames="w-[35.828px]" />
                        </Container1>
                        <Container1>
                          <div className="bg-success rounded-[16777200px] shrink-0 size-[6px]" data-name="span" />
                          <SpanText text="Credit Updated: UPS Corp" />
                          <SpanText1 text="4h ago" additionalClassNames="w-[36.227px]" />
                        </Container1>
                        <Container1>
                          <div className="bg-muted-foreground rounded-[16777200px] shrink-0 size-[6px]" data-name="span" />
                          <SpanText text="Partner Archived: Nissan NA" />
                          <SpanText1 text="1d ago" additionalClassNames="w-[33.828px]" />
                        </Container1>
                        <Container1>
                          <div className="bg-violet rounded-[16777200px] shrink-0 size-[6px]" data-name="span" />
                          <SpanText text="New Contact: Tanya Bailey" />
                          <SpanText1 text="1d ago" additionalClassNames="w-[33.828px]" />
                        </Container1>
                        <div className="h-[39.5px] relative shrink-0 w-full" data-name="Container">
                          <div className="flex flex-row items-center size-full">
                            <div className="content-stretch flex gap-[10px] items-center px-[14px] relative size-full">
                              <div className="bg-[#ea580c] rounded-[16777200px] shrink-0 size-[6px]" data-name="span" />
                              <SpanText text="Group Assigned: PG-1-1" />
                              <SpanText1 text="2d ago" additionalClassNames="w-[36.063px]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Wrapper10>
      </div>
    </div>
  );
}