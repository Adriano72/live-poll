"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type JokeDialog = "contact" | "quote" | null;

const jokeContent = {
  contact: {
    title: "👻 Comunicazioni ACME™",
    message: "Veramente pensavi esistevamo veramente? 🤨",
    cta: "Ok, hai ragione…",
  },
  quote: {
    title: "💸 Ufficio Preventivi",
    message: "Non te lo potresti mai permettere… 🤑",
    cta: "Già immaginavo",
  },
} as const;

export function Footer() {
  const [openDialog, setOpenDialog] = useState<JokeDialog>(null);
  const activeJoke = openDialog ? jokeContent[openDialog] : null;

  return (
    <>
      <footer className="mt-auto border-t border-primary/20 bg-card/60">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
                <Sparkles className="size-4 shrink-0" />
                ACME Inc.
              </p>
              <p className="text-sm text-muted-foreground">
                App inutili per tutti i gusti
              </p>
              <p className="text-xs text-muted-foreground/80">
                © {new Date().getFullYear()} ACME Inc. — Nessun diritto riservato.
                LivePoll incluso.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-primary/30 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                onClick={() => setOpenDialog("contact")}
              >
                Contattaci
              </Button>
              <Button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setOpenDialog("quote")}
              >
                Richiedi preventivo
              </Button>
            </div>
          </div>
        </div>
      </footer>

      <Dialog
        open={openDialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDialog(null);
          }
        }}
      >
        <DialogContent className="border-primary/30 sm:max-w-md">
          {activeJoke ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-primary">
                  {activeJoke.title}
                </DialogTitle>
                <DialogDescription className="pt-2 text-base leading-relaxed text-foreground">
                  {activeJoke.message}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton={false}>
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => setOpenDialog(null)}
                >
                  {activeJoke.cta}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
