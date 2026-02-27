"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/lib/ui/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { useState } from "react";
import Image from "next/image";
import { APIProvider } from "@vis.gl/react-google-maps";
import RestaurantSelector from "./components/RestaurantSelector";
import MapPage from "./components/Map";
import { supabase } from "@/lib/supabase/client";
import { useStore } from "@/lib/UseStore";
import { v4 } from "uuid";
import { useSupabaseSession } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import useSupabaseUpload from "@/hooks/use-supabase-upload";

const uploadPageSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Dish name must be at least 2 characters.",
    })
    .max(30, {
      message: "Dish name must not be longer than 30 characters.",
    }),
  budget: z.string({
    error: "Please select a price range.",
  }),
  description: z.string().max(160).min(4),
  restaurant: z.string({ error: "Please select a restaurant." }),
  file: z
    .instanceof(File)
    .optional()
    .refine((file) => file, { message: "Please upload an image." }),
});
export type UploadPageValues = z.infer<typeof uploadPageSchema>;

const jst = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
);
const year = String(jst.getFullYear());
const month = String(jst.getMonth() + 1).padStart(2, "0");

export default function UploadPage() {
  const schema = useForm<UploadPageValues>({
    resolver: zodResolver(uploadPageSchema),
    defaultValues: {
      name: "",
      budget: "",
      description: "",
      restaurant: "",
      file: undefined,
    },
    mode: "onChange",
  });

  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: UploadPageValues) {
    console.log(data);
    setIsLoading(true);

    try {
      useSupabaseUpload(data);
      setIsSubmitted(true);
    } catch (err) {
      console.error("❌ onSubmit error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const [files, setFiles] = useState<File[] | undefined>();
  const [filePreview, setFilePreview] = useState<string | undefined>();

  const handleDrop = (files: File[]) => {
    console.log(files);
    setFiles(files);
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          setFilePreview(e.target?.result);
          schema.setValue("file", files[0], { shouldValidate: true });
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

  if (isSubmitted) {
    return (
      <main className="flex flex-col justify-center items-center h-screen bg-white text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <CheckCircle className="text-green-500 w-24 h-24 mb-6" />
        </motion.div>
        <h1 className="text-2xl font-semibold mb-2">Upload Complete!</h1>
        <p className="text-gray-600 mb-8">
          Your dish has been uploaded successfully.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => router.push("/")}
            className="bg-green-600 hover:bg-green-700"
          >
            Go Home
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            Upload Another
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Header title={"Upload"} />

      <Form {...schema}>
        <form
          onSubmit={schema.handleSubmit(onSubmit)}
          className="space-y-6 m-6"
        >
          <FormField
            control={schema.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <Dropzone
                  accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
                  onDrop={handleDrop}
                  onError={console.error}
                  src={files}
                >
                  <DropzoneEmptyState />
                  <DropzoneContent>
                    {filePreview && (
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden">
                        <Image
                          alt="Preview"
                          fill
                          className="object-cover"
                          src={filePreview}
                        />
                      </div>
                    )}
                  </DropzoneContent>
                </Dropzone>
              </FormItem>
            )}
          />

          <FormField
            control={schema.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What did you eat?</FormLabel>
                <FormControl>
                  <Input placeholder="Ramen" {...field} />
                </FormControl>
                <FormDescription>
                  Pick a clear dish name so others instantly know what you ate.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={schema.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Creamy pork and soy sauce broth, thick noodles, and toppings like seaweed and roasted pork."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Briefly describe what you ate.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={schema.control}
            name="restaurant"
            render={({ field }) => (
              <APIProvider apiKey={apiKey} language="en">
                <FormItem>
                  <FormLabel>Restaurant</FormLabel>
                  <RestaurantSelector field={field} />
                  <FormDescription>
                    Pick the restaurant you visited.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
                <MapPage />
              </APIProvider>
            )}
          />

          <FormField
            control={schema.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Range</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a price range…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">¥1 ~ 1,000</SelectItem>
                    <SelectItem value="2">¥1,000 ~ 2,000</SelectItem>
                    <SelectItem value="3">¥2,000 ~ 3,000</SelectItem>
                    <SelectItem value="4">¥3,000 ~ 4,000</SelectItem>
                    <SelectItem value="5">¥4,000 ~ 5,000</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="relative">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
