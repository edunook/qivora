import { Star } from "lucide-react";
import { Review } from "../../types";
import { Card } from "../ui/Card";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <div className="grid gap-4">
      {reviews.map((review) => (
        <Card key={review._id} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={review.author.avatar} alt={review.author.name} className="h-10 w-10 rounded-2xl object-cover" />
              <div>
                <p className="font-semibold text-white">{review.author.name}</p>
                <p className="text-xs text-slate-400">@{review.author.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-300">
              <Star className="h-4 w-4 fill-current" />
              <span>{review.rating.toFixed(1)}</span>
            </div>
          </div>
          {review.title ? <h4 className="font-medium text-slate-100">{review.title}</h4> : null}
          <p className="text-sm text-slate-300">{review.comment}</p>
        </Card>
      ))}
    </div>
  );
}
