import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Tv,
  Gamepad2,
  Wind,
  Wifi,
  Coffee,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Crown,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export const ROOM_GALLERY = [
  {
    id: 'platform',
    title: 'The Platform — Standart Zal',
    subtitle: 'Oddiy Zal & PlayStation 5 Lounge',
    badge: 'Standart Zal',
    price: "20 000 so'm / soat",
    image: '/gallery/room-platform.jpg',
    description:
      'Katta zaldagi zamonaviy konsollar qatori: individual 4K devoriy displeylar, yulduzli neon shifti, qulay yumshoq divanlar va do‘stlar davrasi uchun ajoyib muhit.',
    specs: ['5x PS5 Konsol', '4K Ultra HD', 'Yumshoq divanlar', "20 000 so'm / soat"],
    roomNumber: 1,
  },
  {
    id: 'gamezone',
    title: 'Game Zone — 4K HDR Pro',
    subtitle: 'Tekken 8 • NBA 2K25 • Overcooked 2',
    badge: 'Pro Gaming',
    price: "25 000 so'm / soat",
    image: '/gallery/room-gamezone.jpg',
    description:
      "Katta 4K HDR televizorlar, professional o'yin stullari va divanlar, mashhur fayting va sport o'yinlari uchun maxsus qulay zona.",
    specs: ['5x PS5 Pro Zallari', 'DualSense pultlar', 'Kuchli sovutish', "25 000 so'm / soat"],
    roomNumber: 2,
  },
  {
    id: 'neon',
    title: 'Neon Pulse Lounge',
    subtitle: 'eFootball & FIFA Arena',
    badge: 'Neon & Chill',
    price: "30 000 so'm / soat",
    image: '/gallery/room-neon.jpg',
    description:
      "Devordagi kardiogramma neon nurlari bilan jihozlangan shinam burchak. Qulay gilam qoplamasi, yumshoq o'rindiqlar va jo'shqin futbol bahslari uchun eng qulay shinam atmosfera.",
    specs: ['Neon atmosfera', "Kardiogramma yorug'lik", "Do'stlar davrasi", "30 000 so'm / soat"],
    roomNumber: 3,
  },
  {
    id: 'comfort',
    title: 'Grand Arena — Comfort Zone',
    subtitle: 'Katta 65" Ekran & Kiber Maydon',
    badge: 'Comfort Arena',
    price: "35 000 so'm / soat",
    image: '/gallery/room-comfort.jpg',
    description:
      "Premium darajadagi keng va shinam zona: katta 65 dyuymli 4K Ultra HD ekranlar, kuchaytirilgan dinamik surround audio va lyuks yumshoq divanlar.",
    specs: ['65" Katta Ekran', 'Deluxe divanlar', 'Surround ovoz', "35 000 so'm / soat"],
    roomNumber: 4,
  },
  {
    id: 'vip',
    title: 'VIP Akustik Kabina',
    subtitle: 'Shovqinsiz Shaxsiy VIP Hudud',
    badge: 'VIP Kabina',
    price: "45 000 so'm / soat",
    image: '/gallery/room-vip.jpg',
    description:
      'Akustik piramida panellari bilan qoplangan maxsus VIP 5-xona. Tashqi shovqinlardan to‘liq himoyalangan, katta 75" 4K displey, mukammal surround audio va to\'liq maxfiylik.',
    specs: ['Akustik ovoz yutish', '75" Cinema 4K', 'VIP maxfiylik', "45 000 so'm / soat"],
    roomNumber: 5,
  },
];

export default function Info() {
  const { totalRooms = 5, totalStations = 25, availableStationsCount = 25 } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Dynamic gallery items that reactively update on language change
  const roomGallery = [
    {
      id: 'platform',
      title: t('infoPage.room1Title'),
      subtitle: t('infoPage.room1Subtitle'),
      badge: t('infoPage.room1Badge'),
      price: t('infoPage.room1Price'),
      image: '/gallery/room-platform.jpg',
      description: t('infoPage.room1Desc'),
      specs: [
        t('infoPage.room1Spec1'),
        t('infoPage.room1Spec2'),
        t('infoPage.room1Spec3'),
        t('infoPage.room1Spec4'),
      ],
      roomNumber: 1,
    },
    {
      id: 'gamezone',
      title: t('infoPage.room2Title'),
      subtitle: t('infoPage.room2Subtitle'),
      badge: t('infoPage.room2Badge'),
      price: t('infoPage.room2Price'),
      image: '/gallery/room-gamezone.jpg',
      description: t('infoPage.room2Desc'),
      specs: [
        t('infoPage.room2Spec1'),
        t('infoPage.room2Spec2'),
        t('infoPage.room2Spec3'),
        t('infoPage.room2Spec4'),
      ],
      roomNumber: 2,
    },
    {
      id: 'neon',
      title: t('infoPage.room3Title'),
      subtitle: t('infoPage.room3Subtitle'),
      badge: t('infoPage.room3Badge'),
      price: t('infoPage.room3Price'),
      image: '/gallery/room-neon.jpg',
      description: t('infoPage.room3Desc'),
      specs: [
        t('infoPage.room3Spec1'),
        t('infoPage.room3Spec2'),
        t('infoPage.room3Spec3'),
        t('infoPage.room3Spec4'),
      ],
      roomNumber: 3,
    },
    {
      id: 'comfort',
      title: t('infoPage.room4Title'),
      subtitle: t('infoPage.room4Subtitle'),
      badge: t('infoPage.room4Badge'),
      price: t('infoPage.room4Price'),
      image: '/gallery/room-comfort.jpg',
      description: t('infoPage.room4Desc'),
      specs: [
        t('infoPage.room4Spec1'),
        t('infoPage.room4Spec2'),
        t('infoPage.room4Spec3'),
        t('infoPage.room4Spec4'),
      ],
      roomNumber: 4,
    },
    {
      id: 'vip',
      title: t('infoPage.room5Title'),
      subtitle: t('infoPage.room5Subtitle'),
      badge: t('infoPage.room5Badge'),
      price: t('infoPage.room5Price'),
      image: '/gallery/room-vip.jpg',
      description: t('infoPage.room5Desc'),
      specs: [
        t('infoPage.room5Spec1'),
        t('infoPage.room5Spec2'),
        t('infoPage.room5Spec3'),
        t('infoPage.room5Spec4'),
      ],
      roomNumber: 5,
    },
  ];

  // Lightbox state for crystal clear image inspection
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsZoomed(false);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setIsZoomed(false);
  };

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setIsZoomed(false);
    setLightboxIndex((prev) => (prev + 1) % roomGallery.length);
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setIsZoomed(false);
    setLightboxIndex((prev) => (prev - 1 + roomGallery.length) % roomGallery.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  const activeLightboxItem = lightboxIndex !== null ? roomGallery[lightboxIndex] : null;

  const clubFeatures = [
    {
      icon: Tv,
      title: t('infoPage.screensQuality'),
      desc: t('infoPage.screensQualityDesc'),
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/30',
    },
    {
      icon: Gamepad2,
      title: t('infoPage.consolesModel'),
      desc: t('infoPage.consolesModelDesc'),
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/30',
    },
    {
      icon: Wind,
      title: t('infoPage.airConditioning'),
      desc: t('infoPage.airConditioningDesc'),
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      icon: Wifi,
      title: t('infoPage.fastInternet'),
      desc: t('infoPage.fastInternetDesc'),
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30',
    },
    {
      icon: Coffee,
      title: t('infoPage.snackBar'),
      desc: t('infoPage.snackBarDesc'),
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      icon: ShieldCheck,
      title: t('infoPage.controllersCleaning'),
      desc: t('infoPage.controllersCleaningDesc'),
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/30',
    },
  ];

  return (
    <div className="space-y-8 pb-12 select-none animate-fadeIn">
      {/* 1. Top Hero Section with Glowing Accents */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#131F33] to-[#0A0F1D] border border-[#253449] p-6 sm:p-8 lg:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        {/* Ambient neon decorative background light blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('infoPage.badge')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {t('infoPage.title')}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {t('infoPage.subtitle')}
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
            <div className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-[#162235]/90 border border-[#2B3D55] text-center min-w-[110px]">
              <div className="text-2xl font-black text-cyan-400">{totalRooms}</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                {t('infoPage.totalRoomsLabel')}
              </div>
            </div>
            <div className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-[#162235]/90 border border-[#2B3D55] text-center min-w-[110px]">
              <div className="text-2xl font-black text-white">{totalStations}</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                {t('infoPage.totalStationsLabel')}
              </div>
            </div>
            <div className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-[#162235]/90 border border-emerald-500/30 text-center min-w-[110px]">
              <div className="text-2xl font-black text-emerald-400">{availableStationsCount}</div>
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mt-0.5">
                {t('nav.free')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Photo Gallery Section with Click-to-Zoom in High Resolution */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>{t('infoPage.galleryTitle')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t('infoPage.gallerySubtitle')}
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
            <Maximize2 className="w-3.5 h-3.5" />
            {t('infoPage.photosCount', { count: roomGallery.length })}
          </span>
        </div>

        {/* Gallery Grid — 5 Rooms Tiered Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomGallery.map((item, index) => {
            const isVip = item.roomNumber === 5;
            return (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className={`group relative rounded-3xl transition-all duration-300 overflow-hidden shadow-lg cursor-pointer flex flex-col ${
                  isVip
                    ? 'bg-gradient-to-b from-[#181C2E] via-[#121626] to-[#0D101D] border-2 border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.25)] hover:border-amber-400 hover:shadow-[0_0_45px_rgba(245,158,11,0.35)]'
                    : 'bg-[#111A29] border border-[#223247] hover:border-cyan-500/60 hover:shadow-[0_10px_35px_rgba(6,182,212,0.25)]'
                }`}
              >
                {/* Image Frame */}
                <div className="relative w-full h-60 sm:h-64 overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Dark gradient vignette over image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111A29] via-transparent to-black/40" />

                  {/* Badge Tag Top Left: Room number & Zone Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black backdrop-blur-md shadow-md border ${
                        isVip
                          ? 'bg-amber-950/85 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : 'bg-[#0D1522]/85 text-cyan-300 border-cyan-500/40'
                      }`}
                    >
                      {isVip && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                      <span>
                        {item.roomNumber}-xona • {item.badge}
                      </span>
                    </span>
                  </div>

                  {/* Tariff Price Tag Top Right */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black backdrop-blur-md shadow-md border ${
                        isVip
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                          : 'bg-emerald-950/85 text-emerald-300 border-emerald-500/50'
                      }`}
                    >
                      {item.price}
                    </span>
                  </div>
                </div>

                {/* Text Info Below Image */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isVip ? 'text-amber-400' : 'text-cyan-400'
                      }`}
                    >
                      {item.subtitle}
                    </div>
                    <h3
                      className={`text-lg font-black text-white mt-1 transition-colors ${
                        isVip ? 'group-hover:text-amber-300' : 'group-hover:text-cyan-300'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2 line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  {/* Specs chips */}
                  <div className="mt-4 pt-4 border-t border-[#202E42] flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex flex-wrap gap-1.5">
                      {item.specs.slice(0, 3).map((spec, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium bg-[#172337] text-slate-300 px-2 py-0.5 rounded-md border border-[#273952]"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/rooms?room=${item.roomNumber}`);
                      }}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                        isVip
                          ? 'text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40'
                          : 'text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30'
                      }`}
                    >
                      <span>{t('infoPage.goToRoom')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Club Amenities & Equipment Details Grid */}
      <div className="pt-4">
        <div className="mb-5">
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <span>{t('infoPage.amenitiesTitle')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('infoPage.amenitiesSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#111A29]/90 border border-[#223247] hover:border-[#2D425E] transition-all flex items-start gap-4 shadow-sm"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${f.bg} ${f.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{f.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Live Room Stations Quick Overview */}
      <div className="pt-4">
        <div className="p-6 rounded-3xl bg-[#101826] border border-[#223247] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t('infoPage.liveControlTitle')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('infoPage.liveControlSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/rooms')}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all active:scale-95"
          >
            <span>{t('infoPage.goToRoomsButton')}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>

      {/* 5. High-Resolution Interactive Lightbox Modal */}
      {lightboxIndex !== null && activeLightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-6 animate-fadeIn"
          onClick={closeLightbox}
        >
          {/* Top Control Bar */}
          <div
            className="w-full max-w-6xl flex items-center justify-between py-2 border-b border-white/10 text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {activeLightboxItem.roomNumber}-xona • {activeLightboxItem.badge}
              </span>
              <span className="text-sm font-bold text-white hidden sm:inline">
                {activeLightboxItem.title}
              </span>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                {activeLightboxItem.price}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-bold text-white">
                {lightboxIndex + 1} / {roomGallery.length}
              </span>

              {/* Zoom toggle button */}
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
                title={isZoomed ? t('infoPage.zoomOut') : t('infoPage.zoomIn')}
              >
                {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              </button>

              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition-colors ml-1"
                title={t('infoPage.close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Crystal Clear Image Display Area */}
          <div
            className="relative flex-1 w-full max-w-6xl flex items-center justify-center my-3 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Image Button */}
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-2xl bg-black/60 hover:bg-cyan-500 text-white hover:text-black border border-white/20 flex items-center justify-center transition-all shadow-xl active:scale-95"
              title={t('infoPage.prevImage')}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Image Button */}
            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-2xl bg-black/60 hover:bg-cyan-500 text-white hover:text-black border border-white/20 flex items-center justify-center transition-all shadow-xl active:scale-95"
              title={t('infoPage.nextImage')}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* High-Resolution Crisp Image */}
            <div
              className={`transition-all duration-300 flex items-center justify-center ${
                isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={activeLightboxItem.image}
                alt={activeLightboxItem.title}
                className="max-h-[68vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] border border-cyan-500/30"
              />
            </div>
          </div>

          {/* Bottom Info Details & Thumbnails */}
          <div
            className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-t border-white/10 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center sm:text-left max-w-xl">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span>{activeLightboxItem.title}</span>
                <span className="text-xs text-emerald-400 font-bold">({activeLightboxItem.price})</span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1 sm:line-clamp-2">
                {activeLightboxItem.description}
              </p>
            </div>

            {/* Thumbnail switcher */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {roomGallery.map((thumb, idx) => (
                <button
                  key={thumb.id}
                  onClick={() => {
                    setIsZoomed(false);
                    setLightboxIndex(idx);
                  }}
                  className={`relative w-14 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === lightboxIndex
                      ? 'border-cyan-400 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={thumb.image}
                    alt={thumb.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
