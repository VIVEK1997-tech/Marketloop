import { TextInput, TextInputProps } from 'react-native';

type InputProps = TextInputProps & { className?: string };

export const Input = ({ className = '', ...props }: InputProps) => (
  <TextInput
    placeholderTextColor="#94a3b8"
    className={`rounded-[18px] border border-slate-200 bg-white px-4 py-4 text-base text-slate-900 ${className}`}
    {...props}
  />
);
