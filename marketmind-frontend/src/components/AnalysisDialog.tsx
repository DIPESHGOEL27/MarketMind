import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
  analysis: string | null;
  isLoading: boolean;
}

export default function AnalysisDialog({
  isOpen,
  onClose,
  ticker,
  analysis,
  isLoading,
}: AnalysisDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            🐂🐻 Deep Dive Analysis: <span className="text-indigo-600 dark:text-indigo-400">{ticker}</span>
          </DialogTitle>
          <DialogDescription>
            Powered by Gemini 3 Pro (High Reasoning)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 mt-4 pr-4">
          {isLoading ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 text-indigo-600 animate-pulse mb-6">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Thinking deep... (this uses Gemini 3&apos;s advanced reasoning)</span>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
          ) : analysis ? (
            <div className="prose dark:prose-invert max-w-none pb-6">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              No analysis available. Try again.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
