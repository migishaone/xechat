import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  phoneNumber: string;
}

interface CallInterfaceProps {
  contact: Contact;
  callType: 'audio' | 'video';
  callState: 'outgoing' | 'incoming' | 'active' | 'ended';
  onEndCall: () => void;
  onAnswerCall?: () => void;
  onDeclineCall?: () => void;
}

export const CallInterface = ({ 
  contact, 
  callType, 
  callState, 
  onEndCall, 
  onAnswerCall, 
  onDeclineCall 
}: CallInterfaceProps) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'active') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStateText = () => {
    switch (callState) {
      case 'outgoing':
        return 'Calling...';
      case 'incoming':
        return 'Incoming call';
      case 'active':
        return formatDuration(duration);
      case 'ended':
        return 'Call ended';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 p-8">
        <div className="text-center space-y-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <Avatar className="h-32 w-32 mx-auto">
              <AvatarImage src={contact.avatar} alt={contact.name} />
              <AvatarFallback className="bg-muted text-muted-foreground text-3xl">
                {contact.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{contact.name}</h2>
              <p className="text-muted-foreground">{contact.phoneNumber}</p>
            </div>
          </div>

          {/* Call Status */}
          <div className="space-y-2">
            <p className="text-lg text-foreground">{getCallStateText()}</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">
                {callType === 'audio' ? 'Voice Call' : 'Video Call'}
              </span>
            </div>
          </div>

          {/* Call Controls */}
          <div className="space-y-6">
            {callState === 'incoming' && (
              <div className="flex justify-center space-x-6">
                <Button
                  onClick={onDeclineCall}
                  variant="destructive"
                  size="lg"
                  className="h-16 w-16 rounded-full p-0"
                  aria-label="Decline call"
                  title="Decline call"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
                <Button
                  onClick={onAnswerCall}
                  className="h-16 w-16 rounded-full p-0 bg-green-500 hover:bg-green-600"
                  aria-label="Answer call"
                  title="Answer call"
                >
                  <Phone className="h-6 w-6" />
                </Button>
              </div>
            )}

            {(callState === 'active' || callState === 'outgoing') && (
              <div className="space-y-4">
                {callState === 'active' && (
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => setIsMuted(!isMuted)}
                      variant={isMuted ? "destructive" : "secondary"}
                      size="lg"
                      className="h-12 w-12 rounded-full p-0"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button
                      onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                      variant={isSpeakerOn ? "default" : "secondary"}
                      size="lg"
                      className="h-12 w-12 rounded-full p-0"
                      aria-label={isSpeakerOn ? "Disable speaker" : "Enable speaker"}
                      title={isSpeakerOn ? "Disable speaker" : "Enable speaker"}
                    >
                      {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <Button
                    onClick={onEndCall}
                    variant="destructive"
                    size="lg"
                    className="h-16 w-16 rounded-full p-0"
                    aria-label="End call"
                    title="End call"
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {callState === 'active' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Call in progress</p>
              <div className="flex items-center justify-center space-x-4">
                {isMuted && <span className="text-destructive">Muted</span>}
                {isSpeakerOn && <span className="text-primary">Speaker</span>}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
