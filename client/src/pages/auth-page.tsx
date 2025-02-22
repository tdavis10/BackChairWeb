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
import { useQueryClient } from "@tanstack/react-query";

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
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const registerOtpSchema = z.object({
  otp: z.string().min(4, "Please enter the verification code"),
});

const createPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters").refine((val) => val === registerForm.getValues().password, "Passwords must match"),
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
  const queryClient = useQueryClient();
  const [validatedIdentifier, setValidatedIdentifier] = useState<string | null>(null);
  const [identifierType, setIdentifierType] = useState<'email' | 'phone' | null>(null);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [profileDetails, setProfileDetails] = useState<ProfileDetails | null>(null);
  const [registrationStep, setRegistrationStep] = useState<'initial' | 'otp' | 'password'>('initial'); // Track registration steps
  const [isLoading, setIsLoading] = useState(false); // Add loading state


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

  const registerOtpForm = useForm({
    resolver: zodResolver(registerOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const createPasswordForm = useForm({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleValidation = async (data: { emailOrPhone: string }) => {
    setIsLoading(true); // Set loading state
    try {
      const validationResult = WebService.validateEmailOrPhone(data.emailOrPhone);
      console.log('Validation type:', validationResult.type);
      setIdentifierType(validationResult.type);
      let response;
      if (validationResult.type === 'email') {
        setIdentifierType("email")
        response = await WebService.post('emailValidation', {
          email: data.emailOrPhone,
        });
      } else if (validationResult.type === 'phone') {
        setIdentifierType("phone")
        response = await WebService.post('phoneValidation', {
          phone: data.emailOrPhone,
        });
      }

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
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleSendOTP = async () => {
    setIsLoading(true); // Set loading state
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
      setIsLoading(false); // Reset loading state
    }
  };

  const handleVerifyOTP = async (data: { otp: string }) => {
    setIsLoading(true); // Set loading state
    try {
      let response;

      // ✅ Convert OTP back to a string before sending
      const otpAsString = String(data.otp);

      console.log("Final OTP Sent:", otpAsString, typeof otpAsString);


      if (identifierType === "email") {
        response = await WebService.post("verifyOTP", {
          email: profileDetails?.email || validatedIdentifier,
          otp: otpAsString,
        });
      } else if (identifierType === "phone") {
        console.log("ARE WE GETTING HERE?????")
        response = await WebService.post("verifyOTP", {
          email: profileDetails?.email,
          otp: otpAsString,
        });
      }

      if (response?.serverResponse.code === 200) {
        // Create user object from profile details
        const userProfile = response.result.profileDetails;
        const user = {
          id: parseInt(userProfile.encryptedUserId),
          username: userProfile.email,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          phone: userProfile.phone,
          accessToken: userProfile.accessToken
        };

        // Set the user in the query client cache
        queryClient.setQueryData(["/api/user"], user);

        toast({
          title: "Success",
          description: "Successfully verified",
          duration: 2000
        });

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
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true); // Set loading state
    try {
      const cleanPhone = cleanPhoneNumber(data.phone); // Assuming cleanPhoneNumber function exists
      const response = await WebService.post("signUp", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: "", // Password will be set later
        phone: cleanPhone,
        phoneCountryCode: "1", // Assuming these fields are in data
        phoneCountryNameShort: "US", // Assuming these fields are in data
      });
      if (response.serverResponse.code === 602) {
        setRegistrationStep('otp');
        toast({ title: 'OTP Sent', description: 'Check your phone for the verification code' });
      } else {
        toast({ title: 'Registration Failed', description: response.serverResponse.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Registration failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleRegisterOTPVerification = async (data: z.infer<typeof registerOtpSchema>) => {
    setIsLoading(true); // Set loading state
    try {
        const response = await WebService.post("verifyOTP", {
            email: registerForm.getValues().email,
            otp: data.otp
        });
        if (response.serverResponse.code === 200) {
            setRegistrationStep('password');
            createPasswordForm.reset();
            toast({ title: 'OTP Verified', description: 'Please create a password' });
        } else {
            toast({ title: 'OTP Verification Failed', description: response.serverResponse.message, variant: 'destructive' });
        }
    } catch (error) {
        toast({ title: 'Error', description: 'OTP verification failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handlePasswordCreation = async (data: z.infer<typeof createPasswordSchema>) => {
    setIsLoading(true); // Set loading state
    try {
        const resetResponse = await WebService.post('addPassword', {
            email: registerForm.getValues().email,
            password: data.password,
            otp: registerOtpForm.getValues().otp,
        });
        if (resetResponse.serverResponse.code === 200) {
            toast({ title: 'Password Created', description: 'Successfully created password.' });
            setLocation("/"); // Redirect to home page
        } else {
            toast({ title: 'Password Creation Failed', description: resetResponse.serverResponse.message, variant: 'destructive' });
        }
    } catch (error) {
        toast({ title: 'Error', description: 'Password creation failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false); // Reset loading state
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
    registerForm.reset();
    registerOtpForm.reset();
    createPasswordForm.reset();
    setRegistrationStep('initial');
  };

  const handleSkipAndLogin = async () => {
    setIsLoading(true);
    try {
      // Implement logic to create a user and then redirect
      const response = await WebService.post("createAnonymousUser"); //replace with your endpoint
      if (response.serverResponse.code === 200) {
        toast({ title: 'User Created', description: 'Successfully created anonymous user' });
        setLocation("/");
      } else {
        toast({ title: 'User Creation Failed', description: response.serverResponse.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'User creation failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
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
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Continue"}
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
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify Code"}
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
                {registrationStep === 'initial' ? (
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">

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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Registering..." : "Continue"}
                    </Button>
                  </form>
                </Form>
                ) : registrationStep === 'otp' ? (
                  <Form {...registerOtpForm}>
                    <form onSubmit={registerOtpForm.handleSubmit(handleRegisterOTPVerification)} className="space-y-4">
                      <FormField
                        control={registerOtpForm.control}
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
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify Code"}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <Form {...createPasswordForm}>
                    <form onSubmit={createPasswordForm.handleSubmit(handlePasswordCreation)} className="space-y-4">
                      <FormField
                        control={createPasswordForm.control}
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
                      <FormField
                        control={createPasswordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Password & Login"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={handleSkipAndLogin}
                        disabled={isLoading}
                      >
                        {isLoading ? "Skipping..." : "Skip & Login Now"}
                      </Button>
                    </form>
                  </Form>
                )}
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

// Placeholder - Replace with your actual implementation
const cleanPhoneNumber = (phoneNumber: string) => phoneNumber;