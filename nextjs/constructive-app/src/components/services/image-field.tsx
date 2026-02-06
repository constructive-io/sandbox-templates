import { Pencil, Trash2, Upload } from 'lucide-react';

import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';

export interface ImageFieldState {
  url: string;
  file: File | null;
  preview: string | null;
}

export interface ImageFieldProps {
  label: string;
  placeholder: string;
  state: ImageFieldState;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
  disabled: boolean;
}

// TODO: show the upload button when upload is supported
export function ImageField({
  label,
  placeholder,
  state,
  onUrlChange,
  onFileChange,
  onRemove,
  disabled,
}: ImageFieldProps) {
  if (state.file && state.preview) {
    return (
      <div className='grid min-w-0 gap-2'>
        <Label>{label}</Label>
        <div className='bg-muted/40 border-border/60 flex min-w-0 items-center gap-3 rounded-md border p-3'>
          <div
            className='bg-background flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden
							rounded-md'
          >
            <img src={state.preview} alt={label} className='h-full w-full object-cover' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-foreground truncate text-sm font-medium'>{state.file.name}</p>
            <p className='text-muted-foreground text-xs'>{(state.file.size / 1024).toFixed(2)} KB</p>
          </div>
          <div className='flex shrink-0 gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='text-muted-foreground hover:text-foreground h-8 w-8'
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) onFileChange(file);
                };
                input.click();
              }}
              disabled={disabled}
              title='Change'
            >
              <Pencil className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='text-muted-foreground hover:text-destructive h-8 w-8'
              onClick={onRemove}
              disabled={disabled}
              title='Remove'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='grid gap-2'>
      <Label>{label}</Label>
      <div className='relative'>
        <Input
          placeholder={placeholder}
          value={state.url}
          onChange={(e) => onUrlChange(e.target.value)}
          autoComplete='off'
          disabled={disabled}
          className='pr-10'
        />
        {/* <div className='absolute top-0 right-0 flex h-full items-center'>
					<Button
						type='button'
						variant='ghost'
						size='icon'
						className='text-muted-foreground hover:text-foreground mr-2 size-7 rounded-xl'
						onClick={() => {
							const input = document.createElement('input');
							input.type = 'file';
							input.accept = 'image/*';
							input.onchange = (e) => {
								const file = (e.target as HTMLInputElement).files?.[0];
								if (file) onFileChange(file);
							};
							input.click();
						}}
						disabled={disabled}
						title='Upload file'
					>
						<Upload className='h-4 w-4' />
					</Button>
				</div> */}
      </div>
    </div>
  );
}
