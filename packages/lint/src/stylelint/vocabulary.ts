/** Units that are fluid or relative to a container, allowed anywhere. */
export const FLUID_UNITS: ReadonlySet<string> = new Set([
  "%",
  "fr",
  "ch",
  "dvh",
  "dvw",
  "dvb",
  "dvi",
  "cqi",
  "cqb",
  "cqw",
  "cqh",
  "cqmin",
  "cqmax",
  "deg",
  "rad",
  "turn",
  "grad",
  "x",
  "dpi",
  "dppx",
  "",
]);

/** Functions that write a color by hand. */
export const COLOR_FUNCTIONS: ReadonlySet<string> = new Set([
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "color",
]);

/** Color keywords that aren't raw colors. */
export const SAFE_COLOR_WORDS: ReadonlySet<string> = new Set([
  "transparent",
  "currentcolor",
  "inherit",
  "initial",
  "unset",
  "revert",
  "none",
]);

/** The CSS named colors. */
export const NAMED_COLORS: ReadonlySet<string> = new Set(
  "aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen".split(
    " ",
  ),
);

/** Properties whose raw width may be a hairline (≤ 2px). */
export const BORDER_WIDTH_PROPERTIES: ReadonlySet<string> = new Set([
  "border",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-block",
  "border-block-start",
  "border-block-end",
  "border-inline",
  "border-inline-start",
  "border-inline-end",
  "border-width",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-block-width",
  "border-block-start-width",
  "border-block-end-width",
  "border-inline-width",
  "border-inline-start-width",
  "border-inline-end-width",
  "outline",
  "outline-width",
  "column-rule",
  "column-rule-width",
]);
