import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdComponentProps {
  className?: string;
  style?: React.CSSProperties;
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
}

const AdComponent: React.FC<AdComponentProps> = ({ 
    className, 
    style, 
    dataAdSlot, 
    dataAdFormat = "auto", 
    dataFullWidthResponsive = true 
}) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={`ad-container relative w-full flex justify-center my-4 ${className || ''}`} style={style}>
        {/* Placeholder for development/fallback */}
        <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-foreground/10 rounded-xl bg-card/5 -z-10 text-muted-foreground/20 font-black text-xl tracking-widest select-none">
            MESH CARDS
        </div>

        {/* Replace data-ad-client with your actual publisher ID if not set globally */}
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', minHeight: '100px' }}
             data-ad-client="ca-pub-4624755535669065"
             data-ad-slot={dataAdSlot}
             data-ad-format={dataAdFormat}
             data-full-width-responsive={dataFullWidthResponsive ? "true" : "false"}>
        </ins>
    </div>
  );
};

export default AdComponent;
