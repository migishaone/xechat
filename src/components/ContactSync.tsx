import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, UserPlus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CountryCodeSelector } from "@/components/CountryCodeSelector";
import { countries, Country, formatPhoneNumber } from "@/lib/countries";

interface ContactSyncProps {
  onContactAdd: (phoneNumber: string, name: string) => void;
}

export const ContactSync = ({ onContactAdd }: ContactSyncProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Default to US
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddContact = async () => {
    if (!phoneNumber.trim() || !contactName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both phone number and contact name",
        variant: "destructive",
      });
      return;
    }

    const fullPhoneNumber = formatPhoneNumber(phoneNumber, selectedCountry.code);
    setIsLoading(true);
    
    // Simulate contact verification
    setTimeout(() => {
      onContactAdd(fullPhoneNumber, contactName);
      setPhoneNumber("");
      setContactName("");
      setIsLoading(false);
      
      toast({
        title: "Contact added",
        description: `${contactName} has been added to your contacts`,
      });
    }, 1000);
  };

  const mockContacts = [
    { name: "John Doe", phone: "+1 (555) 123-4567", registered: true },
    { name: "Jane Smith", phone: "+1 (555) 987-6543", registered: true },
    { name: "Mike Johnson", phone: "+1 (555) 456-7890", registered: false },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Add Contact</h2>
        <p className="text-sm text-muted-foreground">
          Add contacts by phone number to start messaging
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Add New Contact</span>
          </CardTitle>
          <CardDescription>
            Enter the phone number and name of the person you want to add
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div>
            <label className="text-sm font-medium text-foreground">Contact Name</label>
            <Input
              placeholder="Enter name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button 
            onClick={handleAddContact}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Adding..." : "Add Contact"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phone Contacts</CardTitle>
          <CardDescription>
            Contacts from your phone that use Xe Chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-muted rounded-full">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.phone}</p>
                  </div>
                </div>
                {contact.registered ? (
                  <div className="flex items-center space-x-2 text-primary">
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">On Xe Chat</span>
                  </div>
                ) : (
                  <Button variant="outline" size="sm">
                    Invite
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};