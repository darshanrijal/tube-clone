import { trpc } from "@/__rpc/react";
import {
  type CreateCommentValues,
  createCommentSchema,
} from "@/lib/validation";
import { useClerk, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { UserAvatar } from "../user-avatar";

interface CommentFormProps {
  videoId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "comment" | "reply";
}

export const CommentForm = ({
  videoId,
  onSuccess,
  onCancel,
  parentId,
  variant = "comment",
}: CommentFormProps) => {
  const { user } = useUser();
  const clerk = useClerk();
  const form = useForm<CreateCommentValues>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      comment: "",
    },
  });
  const utils = trpc.useUtils();
  const comment = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.get.invalidate({ videoId });
      utils.comments.get.invalidate({ videoId, parentId });
      toast.success("Comment created");
      form.reset();
      onSuccess?.();
    },

    onError: (err) => toast.warning(err.message),
  });

  function handleSubmit(values: CreateCommentValues) {
    if (!clerk.isSignedIn) {
      return clerk.openSignIn();
    }
    comment.mutate({ ...values, videoId, parentId });
  }
  function handleCancel() {
    form.reset();
    onCancel?.();
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="group flex gap-4"
      >
        <UserAvatar
          size="lg"
          imageUrl={user?.imageUrl ?? "/user-placeholder.svg"}
          name={user?.fullName ?? "USER"}
        />
        <div className="flex-1">
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={
                      variant === "reply"
                        ? "Reply to this comment"
                        : "Add a comment"
                    }
                    className="min-h-0 resize-none overflow-hidden bg-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-2 flex justify-end gap-2">
            {onCancel && (
              <Button variant="ghost" type="button" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" size="sm" disabled={comment.isPending}>
              {variant === "reply" ? "Reply" : "Comment"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
