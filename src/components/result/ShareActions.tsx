"use client";

import { useRef, useState } from "react";
import { ShareCard } from "./ShareCard";
import styles from "./result.module.css";

/** Сериализует переданный SVG-узел и растрирует его в PNG через canvas (без сторонних библиотек). */
async function svgToPngBlob(svg: SVGSVGElement): Promise<Blob> {
  const xml = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
    const width = Number(svg.getAttribute("width"));
    const height = Number(svg.getAttribute("height"));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context недоступен");
    ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob вернул null"))), "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ShareActions({
  nameA,
  nameB,
  score,
  verdictLabel,
  caption,
  shareText = "Наша совместимость по 4 системам — посчитай свою на magialove.ru",
}: {
  nameA: string;
  nameB: string;
  score: number;
  verdictLabel: string;
  /** Чем посчитан балл именно на этой странице — до двух строк на карточке. */
  caption?: string[];
  /** Текст, который уходит вместе с картинкой в мессенджер. */
  shareText?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);

  async function handleDownload() {
    if (!svgRef.current) return;
    setBusy("download");
    try {
      const blob = await svgToPngBlob(svgRef.current);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sovmestimost.png";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    if (!svgRef.current) return;
    setBusy("share");
    try {
      const blob = await svgToPngBlob(svgRef.current);
      const file = new File([blob], "sovmestimost.png", { type: "image/png" });
      const shareData = {
        files: [file],
        title: "Совместимость",
        text: shareText,
      };
      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await handleDownload();
      }
    } catch {
      // пользователь закрыл системный диалог — не ошибка
    } finally {
      setBusy(null);
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.shareBlock}>
      <div className={styles.shareEyebrow}>✨ Твоя карточка готова</div>
      <h2 className={styles.shareHeading}>Поделись результатом</h2>
      <p className={styles.shareSubtext}>
        Сохрани красивую карточку себе или отправь подруге — пусть она тоже узнает
        свою совместимость.
      </p>
      <div className={styles.shareCardPreview}>
        <ShareCard
          ref={svgRef}
          nameA={nameA}
          nameB={nameB}
          score={score}
          verdictLabel={verdictLabel}
          caption={caption}
        />
      </div>
      <div className={styles.shareButtons}>
        <button
          type="button"
          className={styles.sharePrimaryBtn}
          onClick={handleShare}
          disabled={busy !== null}
        >
          {busy === "share" ? "Готовим…" : "💌 Поделиться в Stories"}
        </button>
        <button type="button" className={styles.shareSecondaryBtn} onClick={handleDownload} disabled={busy !== null}>
          {busy === "download" ? "Готовим…" : "Скачать картинку"}
        </button>
        <button type="button" className={styles.shareSecondaryBtn} onClick={handleCopyLink}>
          {copied ? "Ссылка скопирована ✓" : "Скопировать ссылку на результат"}
        </button>
      </div>
    </div>
  );
}
