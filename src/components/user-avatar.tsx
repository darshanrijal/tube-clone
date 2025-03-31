import { type VariantProps, cva } from "class-variance-authority";
import { Avatar, AvatarImage } from "./ui/avatar";
const avatarVariants = cva("", {
  variants: {
    size: {
      default: "size-9",
      xs: "size-4",
      sm: "size-6",
      lg: "size-10",
      xl: "size-40",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl: string;
  name: string;
  className?: string;
  onClick?: () => void;
}

export const UserAvatar = ({
  imageUrl,
  name,
  className,
  size,
  onClick,
}: UserAvatarProps) => {
  return (
    <Avatar className={avatarVariants({ size, className })} onClick={onClick}>
      <AvatarImage src={imageUrl} alt={`Avatar for user ${name}`} />
    </Avatar>
  );
};
