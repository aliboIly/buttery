import { useReducer } from "react";
import type { CSSProperties, ReactElement } from "react";
import { useShortcut } from "@butteryui/core";
import { gradientCss, gradients } from "@butteryui/core/palettes";
import { AppShell, HeaderBar, IconButton, Stage } from "@butteryui/react";
import { Redo2, RotateCcw, Undo2 } from "lucide-react";
import { DesignInspector } from "./DesignInspector.tsx";
import { NEW_DESIGN, SHAPE_SIZES, START, historyReducer } from "./document.ts";
import type { Design } from "./document.ts";
import { Router } from "./router.tsx";
import type { RouterProps } from "./router.tsx";
import "./app.css";

/** The paths the editor has a page for, which a static build writes out. */
export const routes: readonly string[] = ["/"];

function backdropOf(design: Design): string | undefined {
  const preset = gradients.find(({ id }) => id === design.backdrop);
  return preset ? gradientCss(preset) : undefined;
}

/** The editor's own variables, read by its stylesheet. */
type EditorVariables = Readonly<Record<`--editor-${string}`, string>>;

/** The card on the canvas, sized to the canvas so it scales the way an export would draw it. */
function DesignCard({ design }: { readonly design: Design }): ReactElement {
  const style: CSSProperties & EditorVariables = {
    "--editor-corners": String(design.corners),
    "--editor-canvas-width": String(SHAPE_SIZES[design.shape].width),
  };
  return (
    <div className="editor-artwork">
      <div className="editor-card" style={style}>
        <p className="editor-title">{design.title}</p>
      </div>
    </div>
  );
}

function Editor(): ReactElement {
  const [history, dispatch] = useReducer(historyReducer, START);
  const { design } = history;
  const undo = (): void => {
    dispatch({ type: "undo" });
  };
  const redo = (): void => {
    dispatch({ type: "redo" });
  };
  useShortcut("mod+z", undo);
  useShortcut("mod+shift+z", redo);
  return (
    <div className="app">
      <AppShell
        inspectorLabel="Design settings"
        openInspectorLabel="Edit design"
        header={
          <HeaderBar title={design.title} dragRegion>
            <HeaderBar.Actions>
              <HeaderBar.Action
                label="Start over"
                icon={RotateCcw}
                disabled={history.past.length === 0}
                onSelect={() => {
                  dispatch({ type: "change", key: "new", design: NEW_DESIGN });
                  dispatch({ type: "seal" });
                }}
              />
            </HeaderBar.Actions>
            <HeaderBar.Separator />
            <IconButton
              icon={Undo2}
              label="Undo"
              aria-disabled={history.past.length === 0}
              onClick={undo}
            />
            <IconButton
              icon={Redo2}
              label="Redo"
              aria-disabled={history.future.length === 0}
              onClick={redo}
            />
          </HeaderBar>
        }
        inspector={
          <DesignInspector
            design={design}
            onChange={(key, next) => {
              dispatch({ type: "change", key, design: next });
            }}
            onSeal={() => {
              dispatch({ type: "seal" });
            }}
          />
        }
      >
        <Stage
          label={`Design preview: ${design.title}`}
          size={SHAPE_SIZES[design.shape]}
          background={backdropOf(design)}
        >
          <DesignCard design={design} />
        </Stage>
      </AppShell>
    </div>
  );
}

/** The editor: a header with undo and redo, the design on a stage, and an inspector of its settings. */
export function App(props: RouterProps): ReactElement {
  return (
    <Router {...props}>
      <Editor />
    </Router>
  );
}
