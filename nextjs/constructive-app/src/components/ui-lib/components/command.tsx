"use client";

import { Dialog as CommandDialogPrimitive } from "@base-ui/react/dialog";
import type { AutocompleteRootProps } from "@base-ui/react/autocomplete";
import { SearchIcon } from "lucide-react";
import * as React from "react";
import { ModalPortalScope, useRootPortalContainer } from "./portal";
import { mergePropsWithRef } from "../lib/slot";
import { cn } from "../lib/utils";
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteSeparator,
} from "./autocomplete";

const CommandInputContext = React.createContext<{
  inputRef: React.RefObject<HTMLInputElement | null> | null;
}>({
  inputRef: null,
});

const CommandDialog = CommandDialogPrimitive.Root;

function CommandDialogPortal({ ...props }: CommandDialogPrimitive.Portal.Props) {
  const container = useRootPortalContainer();

  const style = {
    ...(props.style ?? {}),
    ['--z-layer-floating' as any]: 'var(--z-layer-floating-elevated)',
  } satisfies React.CSSProperties;

  return <CommandDialogPrimitive.Portal container={container} {...props} style={style} />;
}

type CommandDialogTriggerProps = Omit<
  React.ComponentProps<typeof CommandDialogPrimitive.Trigger>,
  "render" | "nativeButton"
> & {
  /** When true, merges props onto the child element instead of rendering a button */
  asChild?: boolean;
  /** Whether the child renders a native button. Defaults to true when asChild is used. */
  nativeButton?: boolean;
};

function CommandDialogTrigger({
  asChild,
  nativeButton,
  children,
  ...props
}: CommandDialogTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return (
      <CommandDialogPrimitive.Trigger
        data-slot="command-dialog-trigger"
        nativeButton={nativeButton ?? true}
        {...props}
        render={(triggerProps) => {
          const { nativeButton: _, ...rest } = triggerProps as Record<string, unknown>;
          return React.cloneElement(
            children as React.ReactElement<Record<string, unknown>>,
            mergePropsWithRef(rest, children as React.ReactElement),
          );
        }}
      />
    );
  }
  return (
    <CommandDialogPrimitive.Trigger
      data-slot="command-dialog-trigger"
      nativeButton={nativeButton}
      {...props}
    >
      {children}
    </CommandDialogPrimitive.Trigger>
  );
}

function CommandDialogBackdrop({
  className,
  ...props
}: CommandDialogPrimitive.Backdrop.Props) {
  return (
    <CommandDialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-[var(--z-layer-toast)] bg-black/32 backdrop-blur-sm transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      data-slot="command-dialog-backdrop"
      {...props}
    />
  );
}

function CommandDialogViewport({
  className,
  ...props
}: CommandDialogPrimitive.Viewport.Props) {
  return (
    <CommandDialogPrimitive.Viewport
      className={cn(
        "fixed inset-0 z-[var(--z-layer-toast)] flex flex-col items-center px-4 py-[max(--spacing(4),4vh)] sm:py-[10vh]",
        className,
      )}
      data-slot="command-dialog-viewport"
      {...props}
    />
  );
}

function CommandDialogPopup({
  className,
  children,
  ...props
}: CommandDialogPrimitive.Popup.Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <CommandDialogPortal>
      <CommandDialogBackdrop />
      <CommandDialogViewport>
        <CommandDialogPrimitive.Popup
          className={cn(
            "-translate-y-[calc(1.25rem*var(--nested-dialogs))] relative row-start-2 flex max-h-100 min-h-0 w-full min-w-0 max-w-xl scale-[calc(1-0.1*var(--nested-dialogs))] flex-col rounded-2xl border bg-popover bg-clip-padding text-popover-foreground opacity-[calc(1-0.1*var(--nested-dialogs))] shadow-lg transition-[scale,opacity,translate] duration-200 ease-in-out will-change-transform before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:bg-muted/50 before:shadow-[0_1px_--theme(--color-black/4%)] data-nested:data-ending-style:translate-y-8 data-nested:data-starting-style:translate-y-8 data-nested-dialog-open:origin-top data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0 **:data-[slot=scroll-area-viewport]:data-has-overflow-y:pe-1 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]",
            className,
          )}
          data-slot="command-dialog-popup"
          initialFocus={inputRef}
          {...props}
        >
          {/* ModalPortalScope creates a scoped portal container for floating elements inside */}
          <ModalPortalScope>
            <CommandInputContext.Provider value={{ inputRef }}>
              {children}
            </CommandInputContext.Provider>
          </ModalPortalScope>
        </CommandDialogPrimitive.Popup>
      </CommandDialogViewport>
    </CommandDialogPortal>
  );
}

type CommandProps<ItemValue> = Omit<
  AutocompleteRootProps<ItemValue>,
  "autoHighlight" | "keepHighlight" | "open"
> & {
  className?: string;
  autoHighlight?: boolean | "always";
  keepHighlight?: boolean;
  open?: boolean;
};

function Command<ItemValue>({
  autoHighlight = "always",
  keepHighlight = true,
  open = true,
  ...props
}: CommandProps<ItemValue>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AutocompleteAny = Autocomplete as React.ComponentType<any>;
  return (
    <AutocompleteAny
      autoHighlight={autoHighlight}
      keepHighlight={keepHighlight}
      open={open}
      {...props}
    />
  );
}

type CommandInputProps = Omit<
  React.ComponentProps<typeof AutocompleteInput>,
  "onChange"
> & {
  value?: string;
  onValueChange?: (value: string) => void;
};

function CommandInput({
  className,
  placeholder = undefined,
  value,
  onValueChange,
  ...props
}: CommandInputProps) {
  const { inputRef } = React.useContext(CommandInputContext);

  return (
    <div className="px-2.5 py-1.5">
      <AutocompleteInput
        className={cn(
          "border-transparent! bg-transparent! shadow-none before:hidden has-focus-visible:ring-0",
          className,
        )}
        placeholder={placeholder}
        ref={inputRef}
        size="lg"
        startAddon={<SearchIcon />}
        value={value}
        onChange={
          onValueChange
            ? (e: React.ChangeEvent<HTMLInputElement>) =>
                onValueChange(e.target.value)
            : undefined
        }
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteList>) {
  return (
    <AutocompleteList
      className={cn("not-empty:scroll-py-2 not-empty:p-2", className)}
      data-slot="command-list"
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteEmpty>) {
  return (
    <AutocompleteEmpty
      className={cn("not-empty:py-6", className)}
      data-slot="command-empty"
      {...props}
    />
  );
}

function CommandPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className="-mx-px relative min-h-0 rounded-t-xl border bg-popover bg-clip-padding shadow-xs [clip-path:inset(0_1px)] before:pointer-events-none before:absolute before:inset-0 before:rounded-t-[calc(var(--radius-xl)-1px)] **:data-[slot=scroll-area-scrollbar]:mt-2 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]"
      {...props}
    />
  );
}

type CommandGroupProps = React.ComponentProps<typeof AutocompleteGroup> & {
  /** Group heading label */
  heading?: React.ReactNode;
};

function CommandGroup({
  className,
  heading,
  children,
  ...props
}: CommandGroupProps) {
  return (
    <AutocompleteGroup
      className={className}
      data-slot="command-group"
      {...props}
    >
      {heading && <CommandGroupLabel>{heading}</CommandGroupLabel>}
      {children}
    </AutocompleteGroup>
  );
}

function CommandGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteGroupLabel>) {
  return (
    <AutocompleteGroupLabel
      className={className}
      data-slot="command-group-label"
      {...props}
    />
  );
}

function CommandCollection({
  ...props
}: React.ComponentProps<typeof AutocompleteCollection>) {
  return <AutocompleteCollection data-slot="command-collection" {...props} />;
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteItem>) {
  return (
    <AutocompleteItem
      className={cn("py-1.5", className)}
      data-slot="command-item"
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteSeparator>) {
  return (
    <AutocompleteSeparator
      className={cn("my-2", className)}
      data-slot="command-separator"
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <span
      className={cn(
        "ms-auto font-medium text-muted-foreground/72 text-xs tracking-widest",
        className,
      )}
      data-slot="command-shortcut"
      {...props}
    />
  );
}

function CommandFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-b-[calc(var(--radius-2xl)-1px)] px-5 py-3 text-muted-foreground text-xs",
        className,
      )}
      data-slot="command-footer"
      {...props}
    />
  );
}

export {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
  CommandShortcut,
};
