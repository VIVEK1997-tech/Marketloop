import { BadgeCheck, Mail, MapPin, Phone, ShieldCheck, Star } from 'lucide-react';
import { getProfileImage } from '../utils/avatar.js';

const formatMemberSince = (value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

export default function ProfileCard({ user, stats, isSeller, onEditProfile }) {
  const rating = Number(stats?.averageRating || user?.averageRating || 0).toFixed(1);
  const totalReviews = stats?.totalReviews || user?.totalReviews || 0;

  return (
    <aside className="card sticky top-24 overflow-hidden p-0">
      <div className="bg-gradient-to-br from-brand-700 via-cyan-600 to-sky-500 p-6 text-white">
        <div className="flex flex-col items-center text-center">
          <img
            src={getProfileImage(user?.profileImage, user?.name)}
            alt={user?.name || 'Profile'}
            className="h-28 w-28 rounded-full border-4 border-white/70 object-cover shadow-xl"
          />
          <h1 className="mt-4 text-2xl font-black">{user?.name}</h1>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              <Star size={13} className="text-amber-300" /> {rating}/5
            </span>
            {isSeller && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-50">
                <BadgeCheck size={13} /> Verified Seller
              </span>
            )}
          </div>
          <button className="btn mt-5 bg-white text-brand-700 hover:bg-slate-100" onClick={onEditProfile}>
            Edit profile
          </button>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="grid gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-brand-600" />
            <span>{user?.email || 'No email added'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-brand-600" />
            <span>{user?.phone || 'Add a phone number'}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-brand-600" />
            <span>{user?.location?.city || user?.location?.state || user?.location?.country || 'Add your location'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-2xl font-black text-slate-900">{stats?.listingsCount || 0}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Listings</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-2xl font-black text-slate-900">{totalReviews}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Reviews</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-2xl font-black text-slate-900">{stats?.conversationCount || 0}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Chats</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-2xl font-black text-slate-900">{stats?.wishlistCount || 0}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Saved</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Member since</p>
          <p className="mt-1">{formatMemberSince(stats?.memberSince || user?.createdAt || Date.now())}</p>
          <p className="mt-3 inline-flex items-center gap-2 font-semibold text-emerald-700">
            <ShieldCheck size={16} /> Trust improves with consistent listings and reviews
          </p>
        </div>
      </div>
    </aside>
  );
}
