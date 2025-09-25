'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Video, VideoOff, Play, Pause, AlertCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeFocusSession } from '@/ai/flows/analyze-focus-session';

export default function FocusPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [feedback, setFeedback] = useState('Start a session to get feedback.');
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();
    
    // Cleanup function
    return () => {
        if(intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }

  }, [toast]);

  const captureFrame = useCallback((): string | null => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
      }
    }
    return null;
  }, []);

  const analyzeCurrentFrame = useCallback(async () => {
    setIsLoading(true);
    const imageDataUri = captureFrame();
    if (imageDataUri) {
        try {
            const result = await analyzeFocusSession({ imageDataUri });
            setFeedback(result.feedback);
        } catch (error) {
            console.error("Error analyzing frame:", error);
            setFeedback("Could not analyze frame.");
        }
    }
    setIsLoading(false);
  }, [captureFrame]);

  useEffect(() => {
    if (isSessionActive) {
      intervalRef.current = setInterval(analyzeCurrentFrame, 15000); // Analyze every 15 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSessionActive, analyzeCurrentFrame]);

  const toggleSession = () => {
    setIsSessionActive(prev => !prev);
    if (!isSessionActive) {
      setFeedback("Focus session started. I'll check in periodically.");
      analyzeCurrentFrame();
    } else {
      setFeedback("Session paused. Press play to resume.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Focus Zone</CardTitle>
          <CardDescription>
            Start a focused work session. We'll use your camera to help you stay on track.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-lg overflow-hidden border">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            {hasCameraPermission === false && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4">
                <VideoOff className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-bold">Camera Access Required</h3>
                <p className="text-center">Please allow camera access in your browser to use this feature.</p>
              </div>
            )}
          </div>

          {hasCameraPermission === null && (
             <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Checking Camera...</AlertTitle>
                <AlertDescription>
                    Attempting to access your webcam. Please approve the request.
                </AlertDescription>
            </Alert>
          )}

          {hasCameraPermission === false && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Camera Access Denied</AlertTitle>
              <AlertDescription>
                Aivo needs camera access to run a focus session. Please update your browser permissions and refresh the page.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center gap-4">
            <Button onClick={toggleSession} disabled={!hasCameraPermission} size="lg">
                {isSessionActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                {isSessionActive ? 'Pause Session' : 'Start Session'}
            </Button>
            <div className="flex-1 flex items-center gap-3 text-muted-foreground p-3 rounded-lg bg-secondary w-full sm:w-auto">
                <Zap className={`h-5 w-5 ${isLoading ? 'animate-pulse text-primary' : ''}`} />
                <p className="flex-1 text-sm">{feedback}</p>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
