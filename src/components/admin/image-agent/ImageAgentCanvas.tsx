import type { FC, ReactNode } from 'react';
import type { ImageAgentFormat, ImageAgentPostData, ImageAgentTemplateId } from '../../../constants/imageAgent';
import { IMAGE_AGENT_FORMATS } from '../../../constants/imageAgent';
import { OlieLogoMark } from './OlieLogoMark';

interface Props {
  format: ImageAgentFormat;
  templateId: ImageAgentTemplateId;
  data: ImageAgentPostData;
}

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <OlieLogoMark size={40} className={light ? 'bg-white/15 border border-white/25' : undefined} />
      <span className={`font-bold text-xl tracking-tight ${light ? 'text-white' : 'text-olive-900'}`}>OlieCare</span>
    </div>
  );
}

function CtaPill({ text, variant = 'olive' }: { text: string; variant?: 'olive' | 'white' | 'dark' }) {
  const styles = {
    olive: 'bg-olive-600 text-white',
    white: 'bg-white text-olive-800',
    dark: 'bg-gray-900 text-white',
  };
  return (
    <span className={`inline-block px-6 py-3 rounded-full text-base font-semibold tracking-wide ${styles[variant]}`}>
      {text}
    </span>
  );
}

function TextBlock({
  titulo,
  cta,
  light = false,
  titleClass = 'text-4xl',
}: {
  titulo: string;
  cta: string;
  light?: boolean;
  titleClass?: string;
}) {
  return (
    <div className="space-y-6">
      {titulo && (
        <h1 className={`${titleClass} font-bold leading-[1.15] ${light ? 'text-white' : 'text-gray-900'}`}>
          {titulo}
        </h1>
      )}
      {cta && <CtaPill text={cta} variant={light ? 'white' : 'olive'} />}
    </div>
  );
}

function BlogEssencial({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <div className="relative flex overflow-hidden bg-[#f9f6f1]" style={{ width: w, height: h }}>
      <div className="w-[44%] bg-olive-600 relative z-10 flex flex-col justify-between p-10">
        <BrandMark light />
        <TextBlock titulo={data.titulo} cta={data.cta} light titleClass="text-3xl" />
        <p className="text-sm text-white/60">oliecare.cloud</p>
      </div>
      <div className="flex-1 relative">
        {data.backgroundImageUrl ? (
          <img src={data.backgroundImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-olive-100" />
        )}
      </div>
    </div>
  );
}

function BlogJardim({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <div className="relative flex overflow-hidden bg-[#f9f6f1]" style={{ width: w, height: h }}>
      {data.backgroundImageUrl && (
        <img src={data.backgroundImageUrl} alt="" className="absolute right-0 top-0 w-[52%] h-full object-cover" />
      )}
      <div className="relative z-10 flex flex-col justify-between p-10 w-[58%]">
        <BrandMark />
        <TextBlock titulo={data.titulo} cta={data.cta} titleClass="text-3xl" />
      </div>
    </div>
  );
}

function BlogImpulso({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <div className="relative flex overflow-hidden bg-gray-900" style={{ width: w, height: h }}>
      {data.backgroundImageUrl && (
        <img src={data.backgroundImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/85 to-gray-900/30 z-[1]" />
      <div className="relative z-10 flex flex-col justify-between p-10 w-[62%]">
        <BrandMark light />
        <TextBlock titulo={data.titulo} cta={data.cta} light titleClass="text-4xl" />
      </div>
    </div>
  );
}

function BlogAfeto({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <div className="relative flex overflow-hidden bg-olive-50" style={{ width: w, height: h }}>
      {data.backgroundImageUrl && (
        <img src={data.backgroundImageUrl} alt="" className="absolute right-0 inset-y-0 w-[50%] object-cover rounded-l-[2rem]" />
      )}
      <div className="relative z-10 flex flex-col justify-between p-10 w-[55%]">
        <BrandMark />
        <TextBlock titulo={data.titulo} cta={data.cta} titleClass="text-3xl" />
      </div>
    </div>
  );
}

function IgLayout({
  data,
  w,
  h,
  overlay,
  textLight = false,
}: {
  data: ImageAgentPostData;
  w: number;
  h: number;
  overlay: ReactNode;
  textLight?: boolean;
}) {
  return (
    <div className="relative flex flex-col overflow-hidden" style={{ width: w, height: h }}>
      <div className="relative flex-[3]">
        {data.backgroundImageUrl ? (
          <img src={data.backgroundImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-olive-200" />
        )}
        {overlay}
      </div>
      <div className={`relative z-10 flex-[2] flex flex-col justify-between p-8 ${textLight ? 'bg-gray-900 text-white' : 'bg-white'}`}>
        <BrandMark light={textLight} />
        <TextBlock
          titulo={data.titulo}
          cta={data.cta}
          light={textLight}
          titleClass="text-2xl"
        />
        <p className={`text-sm ${textLight ? 'text-white/50' : 'text-olive-500'}`}>@oliecare · oliecare.cloud</p>
      </div>
    </div>
  );
}

function IgEssencial({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <IgLayout
      data={data}
      w={w}
      h={h}
      overlay={<div className="absolute inset-0 bg-olive-600/20" />}
    />
  );
}

function IgJardim({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <IgLayout
      data={data}
      w={w}
      h={h}
      overlay={<div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f9f6f1]/80" />}
    />
  );
}

function IgImpulso({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <div className="relative flex flex-col overflow-hidden bg-gray-900" style={{ width: w, height: h }}>
      {data.backgroundImageUrl && (
        <img src={data.backgroundImageUrl} alt="" className="absolute inset-0 w-full h-[58%] object-cover opacity-60" />
      )}
      <div className="absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-transparent to-gray-900 z-[1]" />
      <div className="relative z-10 mt-auto flex flex-col justify-between p-10 h-full">
        <BrandMark light />
        <TextBlock titulo={data.titulo} cta={data.cta} light titleClass="text-3xl" />
        <p className="text-white/50 text-sm">@oliecare</p>
      </div>
    </div>
  );
}

function IgAfeto({ data, w, h }: { data: ImageAgentPostData; w: number; h: number }) {
  return (
    <IgLayout
      data={data}
      w={w}
      h={h}
      overlay={<div className="absolute inset-0 bg-olive-100/30" />}
    />
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
