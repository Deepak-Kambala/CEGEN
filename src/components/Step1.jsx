import UploadZone from './UploadZone';
import { loadImageFile } from '../utils/canvas';

export default function Step1({ templateImg, templateOrigW, templateOrigH, templateSrc, onTemplate, onNext, showToast }) {
  async function handleFile(file) {
    try {
      const { img, src } = await loadImageFile(file);
      onTemplate(img, img.naturalWidth, img.naturalHeight, src, file.name);
      showToast(`Template loaded: ${img.naturalWidth}×${img.naturalHeight}`);
    } catch {
      showToast('Failed to load image.');
    }
  }

  return (
    <div className="panel">
      <div className="section-title">Upload Certificate Template</div>
      <div className="section-sub">Upload your certificate design as an image. PNG or JPEG recommended for best quality.</div>

      <UploadZone
        accept="image/*"
        onFile={handleFile}
        icon="[IMG]"
        title="Drop your template here"
        subtitle="or click to browse your files"
        tags={['PNG', 'JPG', 'JPEG', 'WEBP']}
      />

      {templateSrc && (
        <div className="template-thumb">
          <img src={templateSrc} alt="Template preview" />
          <div className="thumb-info">{templateOrigW}×{templateOrigH}px</div>
        </div>
      )}

      <div className="btn-row">
        <button className="btn-primary" disabled={!templateImg} onClick={onNext}>
          Next: Define Fields →
        </button>
      </div>
    </div>
  );
}
