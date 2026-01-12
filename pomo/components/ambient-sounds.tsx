"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Volume2, VolumeX, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { track } from "@/lib/analytics"
import { MixpanelEvents } from "@/lib/mixpanel-events"

const AMBIENT_STORAGE_KEY = "codefocus-ambient"

type AmbientSound = "none" | "lofi" | "rain" | "forest" | "cafe"

interface AmbientSettings {
  sound: AmbientSound
  volume: number
  isPlaying: boolean
}

const soundLabels: Record<AmbientSound, string> = {
  none: "None",
  lofi: "Lofi Beats",
  rain: "Rain",
  forest: "Forest",
  cafe: "Coffee Shop (Tvari)",
}

const soundUrls: Record<Exclude<AmbientSound, "none">, string> = {
  lofi: "/sounds/ambient/lofi.mp3",
  rain: "/sounds/ambient/rain.mp3",
  forest: "/sounds/ambient/forest.mp3",
  cafe: "/sounds/ambient/cafe.mp3",
}

const defaultSettings: AmbientSettings = {
  sound: "none",
  volume: 50,
  isPlaying: false,
}

function loadSettings(): AmbientSettings {
  if (typeof window === "undefined") return defaultSettings
  try {
    const stored = localStorage.getItem(AMBIENT_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...defaultSettings, ...parsed, isPlaying: false } // Never auto-play
    }
  } catch {
    // Ignore errors
  }
  return defaultSettings
}

function saveSettings(settings: AmbientSettings) {
  if (typeof window === "undefined") return
  localStorage.setItem(AMBIENT_STORAGE_KEY, JSON.stringify(settings))
}

export function AmbientSounds() {
  const [settings, setSettings] = useState<AmbientSettings>(defaultSettings)
  const [mounted, setMounted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load settings on mount
  useEffect(() => {
    setSettings(loadSettings())
    setMounted(true)
  }, [])

  // Manage audio element
  useEffect(() => {
    if (!mounted) return

    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    // Create new audio if sound selected
    if (settings.sound !== "none") {
      const audio = new Audio(soundUrls[settings.sound])
      audio.loop = true
      audio.volume = settings.volume / 100
      audioRef.current = audio

      if (settings.isPlaying) {
        audio.play().catch(() => {
          // Auto-play blocked, update state
          setSettings((prev) => ({ ...prev, isPlaying: false }))
        })
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [settings.sound, mounted])

  // Handle play/pause changes
  useEffect(() => {
    if (!audioRef.current || !mounted) return

    if (settings.isPlaying) {
      audioRef.current.play().catch(() => {
        setSettings((prev) => ({ ...prev, isPlaying: false }))
      })
    } else {
      audioRef.current.pause()
    }
  }, [settings.isPlaying, mounted])

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.volume / 100
    }
  }, [settings.volume])

  const handleSoundChange = useCallback((sound: AmbientSound) => {
    const newSettings: AmbientSettings = {
      ...settings,
      sound,
      isPlaying: sound !== "none",
    }
    setSettings(newSettings)
    saveSettings(newSettings)
    track(MixpanelEvents.AMBIENT_SOUND_CHANGED, {
      sound,
      label: soundLabels[sound],
    })
  }, [settings])

  const togglePlay = useCallback(() => {
    if (settings.sound === "none") return
    const newSettings = { ...settings, isPlaying: !settings.isPlaying }
    setSettings(newSettings)
    saveSettings(newSettings)
    track(MixpanelEvents.AMBIENT_SOUND_TOGGLED, {
      isPlaying: newSettings.isPlaying,
      sound: settings.sound,
    })
  }, [settings])

  const handleVolumeChange = useCallback((value: number[]) => {
    const newSettings = { ...settings, volume: value[0] }
    setSettings(newSettings)
    saveSettings(newSettings)
  }, [settings])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Music className="h-4 w-4" />
      </Button>
    )
  }

  const isActive = settings.sound !== "none" && settings.isPlaying

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${isActive ? "text-primary" : ""}`}
          aria-label="Ambient sounds"
        >
          {isActive ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <Music className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(Object.keys(soundLabels) as AmbientSound[]).map((sound) => (
          <DropdownMenuItem
            key={sound}
            onClick={() => handleSoundChange(sound)}
            className="gap-2"
          >
            {soundLabels[sound]}
            {settings.sound === sound && <span className="ml-auto text-xs">✓</span>}
          </DropdownMenuItem>
        ))}

        {settings.sound !== "none" && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={togglePlay}
                  aria-label={settings.isPlaying ? "Pause" : "Play"}
                >
                  {settings.isPlaying ? (
                    <Volume2 className="h-3 w-3" />
                  ) : (
                    <VolumeX className="h-3 w-3" />
                  )}
                </Button>
                <Slider
                  value={[settings.volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={5}
                  className="flex-1"
                  aria-label="Volume"
                />
              </div>
            </div>
          </>
        )}

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
