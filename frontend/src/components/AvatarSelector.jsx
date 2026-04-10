import { Camera, Trash2 } from 'lucide-react';
import { getAvatarOptions, getProfileImage } from '../utils/avatar.js';

export default function AvatarSelector({ name, value, onChange }) {
  const avatarOptions = getAvatarOptions(name || 'MarketLoop User');

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="group relative mx-auto h-32 w-32 shrink-0 md:mx-0">
          <img
            src={getProfileImage(value, name)}
            alt={name || 'Profile'}
            className="h-32 w-32 rounded-full border border-slate-200 object-cover shadow-sm transition duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/45 opacity-0 transition group-hover:opacity-100">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700">
              <Camera size={14} /> Change photo
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
            Profile image URL
            <input
              className="input mt-2"
              placeholder="Paste an image URL or choose an avatar below"
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          </label>
          <p className="text-sm text-slate-500">Tip: You can use a hosted image link, or pick one of the built-in avatars below for a polished profile instantly.</p>
          <button
            type="button"
            className="btn-secondary gap-2 text-red-600"
            onClick={() => onChange('')}
          >
            <Trash2 size={16} /> Remove photo
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-black text-slate-900">Choose an avatar</h3>
          <p className="text-sm text-slate-500">Creative presets that work well for both buyers and sellers.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {avatarOptions.map((avatar) => {
            const selected = value === avatar.url;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => onChange(avatar.url)}
                className={`rounded-2xl border p-3 transition ${selected ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'}`}
              >
                <img src={avatar.url} alt={avatar.label} className="mx-auto h-16 w-16 rounded-full object-cover" />
                <p className="mt-2 text-sm font-semibold text-slate-700">{avatar.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
