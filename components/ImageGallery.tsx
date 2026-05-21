import Image from "next/image";

interface ImageGalleryProps {
  images: string;
}

function parseImages(images: string): string[] {
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function GradientPlaceholder({ index }: { index: number }) {
  const gradients = [
    "from-blue-400 to-blue-600",
    "from-blue-500 to-indigo-600",
    "from-indigo-400 to-purple-500",
    "from-blue-300 to-cyan-500",
    "from-cyan-400 to-blue-500",
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
    >
      <svg
        className="w-10 h-10 text-white/40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const imageList = parseImages(images);

  // Ensure we always have 5 slots
  const slots = Array.from({ length: 5 }, (_, i) => imageList[i] || null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
      {/* Main large image */}
      <div className="md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto md:h-full min-h-[300px]">
        {slots[0] ? (
          <Image
            src={slots[0]}
            alt="Ảnh chính"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <GradientPlaceholder index={0} />
        )}
      </div>

      {/* 4 smaller images */}
      {slots.slice(1).map((src, idx) => (
        <div key={idx} className="relative aspect-[4/3] hidden md:block">
          {src ? (
            <Image
              src={src}
              alt={`Ảnh ${idx + 2}`}
              fill
              className="object-cover"
              sizes="25vw"
            />
          ) : (
            <GradientPlaceholder index={idx + 1} />
          )}
        </div>
      ))}
    </div>
  );
}
