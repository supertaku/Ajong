"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, FastForward, LoaderCircle, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "@/app/app-provider";
import type { TranslationKey } from "@/lib/i18n";

const scenes = [
  { id: "family", landscape: "/images/world-family-landscape.png", portrait: "/images/world-family-portrait.png", eyebrow: "home.scene1.eyebrow", title: "home.scene1.title", body: "home.scene1.body", alt: "Clay illustration of a Filipino family planning a home with Kubo" },
  { id: "choices", landscape: "/images/world-choices-landscape.png", portrait: "/images/world-choices-portrait.png", eyebrow: "home.scene2.eyebrow", title: "home.scene2.title", body: "home.scene2.body", alt: "Clay illustration of connected city, townhouse, and suburban neighborhoods" },
  { id: "shortlist", landscape: "/images/world-shortlist-landscape.png", portrait: "/images/world-shortlist-portrait.png", eyebrow: "home.scene3.eyebrow", title: "home.scene3.title", body: "home.scene3.body", alt: "Clay illustration showing many homes becoming a transparent shortlist" },
  { id: "confidence", landscape: "/images/world-confidence-landscape.png", portrait: "/images/world-confidence-portrait.png", eyebrow: "home.scene4.eyebrow", title: "home.scene4.title", body: "home.scene4.body", alt: "Clay illustration of a family approaching a home with due diligence symbols" },
] as const;

const clipChain = [
  { id: "family", desktop: "/videos/scroll-world/family.mp4", mobile: "/videos/scroll-world/family-m.mp4", poster: scenes[0].landscape },
  { id: "family-choices", desktop: "/videos/scroll-world/conn1.mp4", mobile: "/videos/scroll-world/conn1-m.mp4", poster: scenes[0].landscape },
  { id: "choices", desktop: "/videos/scroll-world/choices.mp4", mobile: "/videos/scroll-world/choices-m.mp4", poster: scenes[1].landscape },
  { id: "choices-shortlist", desktop: "/videos/scroll-world/conn2.mp4", mobile: "/videos/scroll-world/conn2-m.mp4", poster: scenes[1].landscape },
  { id: "shortlist", desktop: "/videos/scroll-world/shortlist.mp4", mobile: "/videos/scroll-world/shortlist-m.mp4", poster: scenes[2].landscape },
  { id: "shortlist-confidence", desktop: "/videos/scroll-world/conn3.mp4", mobile: "/videos/scroll-world/conn3-m.mp4", poster: scenes[2].landscape },
  { id: "confidence", desktop: "/videos/scroll-world/confidence.mp4", mobile: "/videos/scroll-world/confidence-m.mp4", poster: scenes[3].landscape },
] as const;

const PLAYBACK_RATE = 2;

function SceneCopy({ scene, index, active }: { scene: typeof scenes[number]; index: number; active: boolean }) {
  const { t } = useApp();

  return (
    <article className={`journey-scene${active ? " active" : ""}`} aria-hidden={!active}>
      <div className={`journey-copy scene-${index + 1}`}>
        <span className="eyebrow">{t(scene.eyebrow as TranslationKey)}</span>
        <h1>{t(scene.title as TranslationKey)}</h1>
        <p>{t(scene.body as TranslationKey)}</p>
        {index === 0 && <div className="hero-actions"><Link tabIndex={active ? undefined : -1} className="button primary" href="/guide">{t("home.start")}<ArrowRight size={18} /></Link><Link tabIndex={active ? undefined : -1} className="button secondary" href="/properties">{t("home.search")}</Link></div>}
        {index === 3 && <Link tabIndex={active ? undefined : -1} className="button primary" href="/guide">{t("home.start")}<ArrowRight size={18} /></Link>}
      </div>
    </article>
  );
}

export function ScrollJourney() {
  const { t } = useApp();
  const ref = useRef<HTMLElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const activeSceneRef = useRef(0);
  const activeClipRef = useRef(0);
  const playingRef = useRef(false);
  const finalCompleteRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const [activeScene, setActiveScene] = useState(0);
  const [activeClip, setActiveClip] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [finalComplete, setFinalComplete] = useState(false);

  const selectClip = useCallback((index: number) => {
    activeClipRef.current = index;
    setActiveClip(index);
  }, []);

  const stopPlayback = useCallback(() => {
    playingRef.current = false;
    setIsPlaying(false);
  }, []);

  const playClip = useCallback((index: number) => {
    const video = videoRefs.current[index];
    if (!video) {
      stopPlayback();
      return;
    }

    video.currentTime = 0;
    video.playbackRate = PLAYBACK_RATE;
    const playback = video.play();
    playback?.catch(() => stopPlayback());
  }, [stopPlayback]);

  const playChapter = useCallback(() => {
    if (playingRef.current) return;

    if (activeSceneRef.current === scenes.length - 1 && finalCompleteRef.current) {
      document.querySelector("#start-options")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const sceneClip = activeSceneRef.current * 2;
    finalCompleteRef.current = false;
    setFinalComplete(false);
    playingRef.current = true;
    setIsPlaying(true);
    selectClip(sceneClip);
    playClip(sceneClip);
  }, [playClip, selectClip]);

  const showPreviousScene = useCallback(() => {
    if (playingRef.current || activeSceneRef.current === 0) return;

    const previousScene = activeSceneRef.current - 1;
    const previousClip = previousScene * 2;
    videoRefs.current.forEach((video) => video?.pause());
    activeSceneRef.current = previousScene;
    setActiveScene(previousScene);
    finalCompleteRef.current = false;
    setFinalComplete(false);
    selectClip(previousClip);
    const video = videoRefs.current[previousClip];
    if (video) video.currentTime = 0;
  }, [selectClip]);

  const handleClipEnded = useCallback((index: number) => {
    if (index !== activeClipRef.current) return;

    const isSceneClip = index % 2 === 0;
    if (isSceneClip && index < clipChain.length - 1) {
      const connectorIndex = index + 1;
      selectClip(connectorIndex);
      playClip(connectorIndex);
      return;
    }

    if (!isSceneClip) {
      const nextScene = (index + 1) / 2;
      const nextClip = index + 1;
      activeSceneRef.current = nextScene;
      setActiveScene(nextScene);
      selectClip(nextClip);
      const video = videoRefs.current[nextClip];
      if (video) video.currentTime = 0;
      stopPlayback();
      return;
    }

    finalCompleteRef.current = true;
    setFinalComplete(true);
    stopPlayback();
  }, [playClip, selectClip, stopPlayback]);

  useEffect(() => {
    if (reducedMotion) return;

    const handleWheel = (event: WheelEvent) => {
      const section = ref.current;
      if (!section || Math.abs(event.deltaY) < 8) return;
      const bounds = section.getBoundingClientRect();
      const journeyIsCurrent = bounds.top < window.innerHeight * 0.35 && bounds.bottom > window.innerHeight * 0.6;
      if (!journeyIsCurrent) return;

      if (playingRef.current) {
        event.preventDefault();
        return;
      }

      if (event.deltaY > 0) {
        if (activeSceneRef.current === scenes.length - 1 && finalCompleteRef.current) return;
        event.preventDefault();
        playChapter();
        return;
      }

      if (activeSceneRef.current > 0) {
        event.preventDefault();
        showPreviousScene();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [playChapter, reducedMotion, showPreviousScene]);

  useEffect(() => () => {
    videoRefs.current.forEach((video) => video?.pause());
  }, []);

  if (reducedMotion) {
    return <section className="reduced-journey" aria-label="Kubo introduction"><picture><source media="(max-width: 700px)" srcSet={scenes[0].portrait} /><Image src={scenes[0].landscape} alt={scenes[0].alt} width={1400} height={900} priority unoptimized /></picture><div><span className="eyebrow">{t("home.eyebrow")}</span><h1>{t("home.title")}</h1><p>{t("home.body")}</p><div className="hero-actions"><Link className="button primary" href="/guide">{t("home.start")}</Link><Link className="button secondary" href="/properties">{t("home.search")}</Link></div></div></section>;
  }

  const playLabel = isPlaying ? t("home.playing") : finalComplete ? t("home.continue") : t("home.play");

  return (
    <section ref={ref} className="scroll-journey" aria-label="Kubo introduction">
      <div className="journey-sticky">
        <div className="journey-media" aria-hidden="true">
          {clipChain.map((clip, index) => (
            <video
              key={clip.id}
              ref={(node) => { videoRefs.current[index] = node; }}
              data-clip={clip.id}
              className={`journey-video${activeClip === index ? " active" : ""}`}
              poster={clip.poster}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              onEnded={() => handleClipEnded(index)}
            >
              <source media="(max-width: 700px)" src={clip.mobile} type="video/mp4" />
              <source src={clip.desktop} type="video/mp4" />
            </video>
          ))}
        </div>
        {scenes.map((scene, index) => <SceneCopy key={scene.id} scene={scene} index={index} active={activeScene === index} />)}
        <Link href="#start-options" className="skip-journey" aria-label={t("home.skip")} title={t("home.skip")}><FastForward size={18} /></Link>
        <div className="journey-controls">
          <button
            type="button"
            className="journey-play"
            onClick={playChapter}
            disabled={isPlaying}
            aria-label={`${playLabel} · ${activeScene + 1} / ${scenes.length}`}
          >
            {isPlaying ? <LoaderCircle className="spin" size={18} /> : finalComplete ? <ArrowDown size={18} /> : <Play size={18} fill="currentColor" />}
          </button>
        </div>
        <div className="scene-rail" role="progressbar" aria-label={t("home.progress")} aria-valuemin={1} aria-valuemax={4} aria-valuenow={activeScene + 1} aria-valuetext={`${activeScene + 1} / 4`}>{scenes.map((scene, index) => <span key={scene.id} className={index === activeScene ? "active" : ""} />)}</div>
        <p className="sr-only" aria-live="polite">{isPlaying ? t("home.playing") : t(scenes[activeScene].title as TranslationKey)}</p>
      </div>
    </section>
  );
}
