import type { FC } from 'react';
import type { ImageAgentFormat, ImageAgentPostData, ImageAgentTemplateId } from '../../../constants/imageAgent';
import { IMAGE_AGENT_FORMATS } from '../../../constants/imageAgent';
import { OlieLogoMark } from './OlieLogoMark';

interface Props {
  format: ImageAgentFormat;
  templateId: ImageAgentTemplateId;
  data: ImageAgentPostData;
}

function Hashtags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.slice(0, 6).map(tag => (
        <span key={tag} className="text-sm font-medium text-olive-700/90">
          {tag.startsWith('#') ? tag : `#${tag}`}
        </span>
      ))}
    </div>
  );
}

function BlogEssencial({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <div className="relative flex overflow-hidden bg-white" style={{ width: w, height: h }}>
      {data.backgroundImageUrl && (
        <img src={data.backgroundImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      )}
      <div className="w-[42%] bg-olive-600 relative z-10 flex flex-col justify-between p-10 text-white">
        <div className="flex items-center gap-3">
          <OlieLogoMark size={40} className="bg-transparent border border-white/30" />
          <span className="font-bold text-xl tracking-tight">OlieCare</span>
        </div>
        <div>
          {data.destaque && <p className="text-2xl font-bold leading-tight mb-4">{data.destaque}</p>}
          <p className="text-sm text-white/70">oliecare.cloud</p>
        </div>
      </div>
      <div className="flex-1 relative z-10 flex flex-col justify-center p-10 pl-12">
        {data.titulo && <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">{data.titulo}</h1>}
        {data.corpo && <p className="text-lg text-gray-600 leading-relaxed mb-6">{data.corpo}</p>}
        <Hashtags tags={data.hashtags} />
      </div>
    </div>
  );
}

function BlogJardim({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <div className="relative flex overflow-hidden bg-[#f5f0e8]" style={{ width: w, height: h }}>
      {data.backgroundImageUrl && (
        <img src={data.backgroundImageUrl} alt="" className="absolute right-0 top-0 w-[55%] h-full object-cover" />
      )}
      <div className="relative z-10 flex flex-col justify-between p-10 w-[58%]">
        <div className="flex items-center gap-3">
          <OlieLogoMark size={38} />
          <span className="font-bold text-xl text-olive-900">OlieCare</span>
          <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-olive-600 bg-olive-100 px-3 py-1 rounded-full">
            Blog
          </span>
        </div>
        <div>
          {data.destaque && <p className="text-olive-700 font-semibold text-lg mb-2">{data.destaque}</p>}
          {data.titulo && <h1 className="text-3xl font-bold text-gray-900 mb-3">{data.titulo}</h1>}
          {data.corpo && <p className="text-gray-600 text-base mb-4">{data.corpo}</p>}
          <Hashtags tags={data.hashtags} />
        </div>
      </div>
    </div>
  );
}

function BlogImpulso({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <div className="relative flex overflow-hidden bg-gray-900" style={{ width: w, height: h }}>
      {data.backgroundImageUrl && (
        <img src={data.backgroundImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent z-[1]" />
      <div className="relative z-10 flex flex-col justify-between p-10 w-[65%] text-white">
        <div className="flex items-center gap-3">
          <OlieLogoMark size={34} className="bg-white/10" />
          <span className="font-bold text-lg">OlieCare</span>
        </div>
        <div>
          {data.destaque && <p className="text-olive-300 font-bold text-xl mb-3">{data.destaque}</p>}
          {data.titulo && <h1 className="text-4xl font-bold leading-tight mb-4">{data.titulo}</h1>}
          {data.corpo && <p className="text-gray-300 text-lg mb-5">{data.corpo}</p>}
          <Hashtags tags={data.hashtags} />
        </div>
      </div>
    </div>
  );
}

function BlogAfeto({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <div className="relative flex overflow-hidden bg-olive-50" style={{ width: w, height: h }}>
      {data.backgroundImageUrl && (
        <img src={data.backgroundImageUrl} alt="" className="absolute right-0 inset-y-0 w-[48%] object-cover rounded-l-3xl" />
      )}
      <div className="relative z-10 flex flex-col justify-between p-10 w-[55%]">
        <div className="flex items-center gap-3">
          <OlieLogoMark size={44} />
          <span className="font-bold text-xl text-olive-900">OlieCare</span>
        </div>
        <div>
          {data.destaque && <p className="text-olive-600 font-medium mb-2">{data.destaque}</p>}
          {data.titulo && <h1 className="text-3xl font-bold text-gray-900 mb-3">{data.titulo}</h1>}
          {data.corpo && <p className="text-gray-600 mb-4">{data.corpo}</p>}
          <Hashtags tags={data.hashtags} />
        </div>
      </div>
    </div>
  );
}

function IgEssencial({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <div className="relative flex flex-col overflow-hidden bg-white" style={{ width: w, height: h }}>
      <div className="relative flex-1 bg-olive-600 flex items-end p-10">
        {data.backgroundImageUrl && (
          <img src={data.backgroundImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-soft-light opacity-60" />
        )}
        <div className="relative z-10">
          {data.destaque && <p className="text-3xl font-bold text-white leading-tight">{data.destaque}</p>}
        </div>
      </div>
      <div className="p-8 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <OlieLogoMark size={44} />
          <span className="font-bold text-2xl text-olive-800">OlieCare</span>
          <span className="ml-auto text-olive-500 font-medium">@oliecare</span>
        </div>
        {data.titulo && <h2 className="text-2xl font-bold text-gray-900 mb-3">{data.titulo}</h2>}
        {data.corpo && <p className="text-gray-600 text-lg mb-4">{data.corpo}</p>}
        <Hashtags tags={data.hashtags} />
      </div>
    </div>
  );
}

function IgJardim({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <div className="relative flex flex-col overflow-hidden bg-[#f5f0e8]" style={{ width: w, height: h }}>
      {data.backgroundImageUrl && (
        <img src={data.backgroundImageUrl} alt="" className="absolute inset-0 w-full h-[55%] object-cover" />
      )}
      <div className="mt-auto relative z-10 p-8 bg-white/95 backdrop-blur-sm rounded-t-3xl">
        <div className="flex items-center gap-3 mb-4">
          <OlieLogoMark size={48} />
          <div>
            <p className="font-bold text-xl text-olive-900">OlieCare</p>
            <p className="text-olive-500 text-sm">@oliecare</p>
          </div>
        </div>
        {data.destaque && <p className="text-olive-700 font-semibold mb-2">{data.destaque}</p>}
        {data.titulo && <h2 className="text-2xl font-bold mb-2">{data.titulo}</h2>}
        {data.corpo && <p className="text-gray-600 mb-4">{data.corpo}</p>}
        <Hashtags tags={data.hashtags} />
      </div>
    </div>
  );
}

function IgImpulso({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-gray-900 p-10 text-white" style={{ width: w, height: h }}>
      {data.backgroundImageUrl && (
        <img src={data.backgroundImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
      )}
      <div className="relative z-10 flex items-center gap-3">
        <OlieLogoMark size={52} className="bg-white/10" />
        <span className="font-bold text-2xl">OlieCare</span>
      </div>
      <div className="relative z-10">
        {data.destaque && <p className="text-olive-300 text-2xl font-bold mb-4">{data.destaque}</p>}
        {data.titulo && <h2 className="text-4xl font-bold leading-tight mb-4">{data.titulo}</h2>}
        {data.corpo && <p className="text-gray-300 text-xl mb-6">{data.corpo}</p>}
        <Hashtags tags={data.hashtags} />
      </div>
      <p className="relative z-10 text-white/50 text-sm">@oliecare</p>
    </div>
  );
}

function IgAfeto({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <div className="relative flex flex-col overflow-hidden bg-olive-100" style={{ width: w, height: h }}>
      {data.backgroundImageUrl && (
        <img src={data.backgroundImageUrl} alt="" className="absolute inset-x-0 top-0 h-[50%] object-cover" />
      )}
      <div className="mt-auto relative z-10 m-6 p-8 bg-white rounded-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <OlieLogoMark size={52} />
          <span className="font-bold text-xl">OlieCare</span>
        </div>
        {data.destaque && <p className="text-olive-600 font-medium mb-2">{data.destaque}</p>}
        {data.titulo && <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.titulo}</h2>}
        {data.corpo && <p className="text-gray-600 mb-4">{data.corpo}</p>}
        <Hashtags tags={data.hashtags} />
        <p className="text-olive-500 text-sm mt-4">@oliecare</p>
      </div>
    </div>
  );
}

const RENDERERS: Record<string, FC<{ data: ImageAgentPostData; w: number; h: number }>> = {
  'blog-essencial': BlogEssencial,
  'blog-jardim': BlogJardim,
  'blog-impulso': BlogImpulso,
  'blog-afeto': BlogAfeto,
  'ig-essencial': IgEssencial,
  'ig-jardim': IgJardim,
  'ig-impulso': IgImpulso,
  'ig-afeto': IgAfeto,
};

export function ImageAgentCanvas({ format, templateId, data }: Props) {
  const { width, height } = IMAGE_AGENT_FORMATS[format];
  const key = `${format === 'blog' ? 'blog' : 'ig'}-${templateId}`;
  const Renderer = RENDERERS[key] ?? BlogEssencial;

  return (
    <div id="image-agent-export-root" className="shadow-2xl rounded-lg overflow-hidden">
      <Renderer data={data} w={width} h={height} />
    </div>
  );
}
