import { useState } from "react";
import { UserPlus, Upload, Ban } from "lucide-react";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";

export default function Register() {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const register = async (e) => {
    e.preventDefault();
    if (!name.trim() || !image) {
      toast("Please provide a name and photo", "error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("image", image);
    formData.append("blacklisted", isBlacklisted ? "true" : "false");

    try {
      await api.post("/visitors/register", formData);
      toast(
        isBlacklisted
          ? "Visitor registered as blacklisted"
          : "Visitor registered successfully",
        isBlacklisted ? "error" : "success"
      );
      setName("");
      setImage(null);
      setPreview(null);
      setIsBlacklisted(false);
    } catch (err) {
      toast(
        err.response?.data?.error || "Registration failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Register Visitor"
        description="Enroll a new face in the recognition database"
      />

      <div className="max-w-xl">
        <Card>
          <form onSubmit={register} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">
                Reference photo
              </label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600">
                  {image ? image.name : "Click to upload (JPEG, PNG)"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </div>

            {preview && (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl ring-2 ring-slate-200"
                />
              </div>
            )}

            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                isBlacklisted
                  ? "bg-red-50 border-red-200"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={isBlacklisted}
                onChange={(e) => setIsBlacklisted(e.target.checked)}
                disabled={loading}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="flex items-center gap-2 font-semibold text-slate-900">
                  <Ban className="w-4 h-4 text-red-600" />
                  Mark as blacklisted
                </span>
                <p className="text-sm text-slate-600 mt-1">
                  Triggers security alerts when this person is detected
                </p>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full py-3 flex items-center justify-center gap-2 ${
                isBlacklisted ? "!bg-red-600 hover:!bg-red-700" : ""
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing face…
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {isBlacklisted ? "Register as blacklisted" : "Register visitor"}
                </>
              )}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
