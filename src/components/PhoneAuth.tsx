import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CountryCodeSelector } from "@/components/CountryCodeSelector";
import { countries, Country, formatPhoneNumber } from "@/lib/countries";

interface PhoneAuthProps {
  onAuthenticated: (phoneNumber: string) => void;
}

export const PhoneAuth = ({ onAuthenticated }: PhoneAuthProps) => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Default to US
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    const fullPhoneNumber = formatPhoneNumber(phoneNumber, selectedCountry.code);
    setIsLoading(true);
    
    // Simulate sending verification code
    setTimeout(() => {
      setIsLoading(false);
      setStep('code');
      toast({
        title: "Verification code sent",
        description: `Code sent to ${fullPhoneNumber}`,
      });
    }, 2000);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Verification code required",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate code verification
    setTimeout(() => {
      setIsLoading(false);
      if (verificationCode === "123456") {
        onAuthenticated(phoneNumber);
        toast({
          title: "Welcome to Xe Chat!",
          description: "You're now ready to start messaging",
        });
      } else {
        toast({
          title: "Invalid code",
          description: "Please check your code and try again",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-chat-bg p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-3 bg-primary rounded-full w-fit">
            <MessageSquare className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome to Xe Chat</CardTitle>
            <CardDescription className="mt-2">
              {step === 'phone' 
                ? "Enter your phone number to get started" 
                : "Enter the verification code we sent to your phone"
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'phone' ? (
            <>
              <div>
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <div className="flex space-x-2 mt-1">
                  <CountryCodeSelector 
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                    disabled={isLoading}
                  />
                  <Input
                    type="tel"
                    placeholder="123-456-7890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Full number: {formatPhoneNumber(phoneNumber || "123-456-7890", selectedCountry.code)}
                </p>
              </div>
              <Button 
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Sending..." : (
                  <>
                    Send Verification Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-foreground">Verification Code</label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="mt-1 text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use code: 123456 for demo
                </p>
              </div>
              <Button 
                onClick={handleVerifyCode}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStep('phone')}
                className="w-full"
              >
                Change Phone Number
              </Button>
            </>
          )}
          
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};