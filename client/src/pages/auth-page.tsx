import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { WebService } from "@/lib/web-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Redirect, useLocation } from "wouter";
import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Schema for the initial validation step
const validateSchema = z.object({
  emailOrPhone: z.string()
    .min(1, "Email or phone number is required")
    .refine((value) => {
      const { isValid } = WebService.validateEmailOrPhone(value);
      return isValid;
    }, "Please enter a valid email or phone number")
});

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  otp: z.string().min(4, "Please enter the verification code"),
});

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
});

type LoginMethod = 'password' | 'otp' | null;

type ProfileDetails = {
  email: string;
  phone: string;
  accessToken?: string;
};

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [validatedIdentifier, setValidatedIdentifier] = useState<string | null>(null);
  const [identifierType, setIdentifierType] = useState<'email' | 'phone' | null>(null);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [profileDetails, setProfileDetails] = useState<ProfileDetails | null>(null);

  const validateForm = useForm({
    resolver: zodResolver(validateSchema),
    defaultValues: {
      emailOrPhone: "",
    },
  });

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
    },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const handleValidation = async (data: { emailOrPhone: string }) => {
    try {
      const validationResult = WebService.validateEmailOrPhone(data.emailOrPhone);
      setIdentifierType(validationResult.type);

      const response = await WebService.post('emailValidation', {
        email: data.emailOrPhone,
      });

      if (response.serverResponse.code === 200) {
        setValidatedIdentifier(data.emailOrPhone);
        if (response.result?.profileDetails) {
          setProfileDetails(response.result.profileDetails);
        }
        toast({
          title: "Validation successful",
          description: "Please choose how you'd like to sign in",
        });
      } else {
        toast({
          title: "Validation failed",
          description: response.serverResponse.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate email/phone. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendOTP = async () => {
    try {
      setIsResendingOtp(true);
      let response;

      if (identifierType === "email") {
        response = await WebService.post('resendOTP', { 
          email: validatedIdentifier 
        });
      } else if (identifierType === "phone") {
        response = await WebService.post('resendOTPbySms', { 
          email: profileDetails?.email || 'tanner.davis002@gmail.com'
        });
      }

      if (response?.serverResponse.code === 200) {
        setLoginMethod('otp');
        toast({
          title: "Code sent",
          description: `We've sent a verification code to your ${identifierType}`,
        });
      } else {
        throw new Error(response?.serverResponse.message || 'Failed to send code');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleVerifyOTP = async (data: { otp: string }) => {
    try {
      let response;

      if (identifierType === "email") {
        response = await WebService.post("verifyOTP", {
          email: profileDetails?.email || validatedIdentifier,
          otp: data.otp,
        });
      } else if (identifierType === "phone") {
        response = await WebService.post("loginWithPhoneOTP", {
          phone: profileDetails?.phone,
          otp: data.otp,
        });
      }

      if (response?.serverResponse.code === 200) {
        toast({
          title: "Success",
          description: "Successfully verified",
          duration: 2000, // 2 seconds
        });
        // Navigate to home page
        setLocation("/");
      } else {
        toast({
          title: "Verification failed",
          description: response?.serverResponse.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetLogin = () => {
    setValidatedIdentifier(null);
    setLoginMethod(null);
    setIdentifierType(null);
    setProfileDetails(null);
    validateForm.reset();
    loginForm.reset();
    otpForm.reset();
  };

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <img 
              src="../../public/logo.png" 
              alt="The Back Chair Logo" 
              className="h-16 mb-4 mx-auto"
            />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                {!validatedIdentifier ? (
                  <Form {...validateForm}>
                    <form onSubmit={validateForm.handleSubmit(handleValidation)} className="space-y-4">
                      <FormField
                        control={validateForm.control}
                        name="emailOrPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email or Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter email or phone number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        Continue
                      </Button>
                    </form>
                  </Form>
                ) : !loginMethod ? (
                  <div className="space-y-4">
                    <Button 
                      className="w-full" 
                      onClick={() => setLoginMethod('password')}
                    >
                      Continue with Password
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={handleSendOTP}
                      disabled={isResendingOtp}
                    >
                      {isResendingOtp ? "Sending code..." : "Send me a code"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full"
                      onClick={resetLogin}
                    >
                      Use a different email/phone
                    </Button>
                  </div>
                ) : loginMethod === 'password' ? (
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setLoginMethod(null)}
                      >
                        Try another method
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
                      <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verification Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter verification code" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        Verify Code
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleSendOTP}
                        disabled={isResendingOtp}
                      >
                        {isResendingOtp ? "Sending..." : "Resend Code"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setLoginMethod(null)}
                      >
                        Try another method
                      </Button>
                    </form>
                  </Form>
                )}
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? "Creating account..." : "Register"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="hidden md:flex flex-col items-center justify-center p-8 bg-primary text-primary-foreground">
        <h1 className="text-4xl font-bold mb-6">Experience Comfort</h1>
        <p className="text-lg text-center max-w-md">
          Sign in to manage your motorized office chair settings and warranty. New users can register for an account to unlock all features.
        </p>
      </div>
    </div>
  );
}