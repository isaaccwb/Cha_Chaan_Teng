"use client";

/**
 * 編輯品項表單 + 「重新生成 AI 相片」按鈕。
 * 對應 docs/PROJECT_PLAN.md 〈二、技術架構 §4.3〉+〈四、AI 圖片生成 Prompt 套件〉。
 *
 * 點解成頁係 client component:
 * 呢頁淨係俾我(職員後台 agent)寫,但生圖 route
 * (app/api/admin/menu-items/[id]/generate-image/route.ts)由另一個 agent負責,
 * 我呢邊淨係要「呼叫佢 + loading spinner」。要喺撳掣嗰下即時顯示 spinner、
 * 唔使成頁 reload,必須要有 client-side state,而 Next.js 嘅 "use client"
 * 係成個檔案級別嘅 directive,冇辦法喺呢個 Server Component page 入面淨係
 * 局部包一個 client 小組件(嗰種寫法要求開多一個獨立檔案,唔喺我獲派嘅
 * 檔案清單入面)。所以成頁改用 client component,靠直接 import
 * lib/actions/menu.ts 嘅 Server Actions 當 RPC 咁 call(Next.js 官方支援
 * Server Action 唔一定要綁喺 <form action> 度,client component 入面直接
 * await 都得),data 用 getMenuItemForEdit(itemId) 喺 useEffect 攞。
 */
import { use, useEffect, useState, useRef, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Fan, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createItemOption,
  deleteItemOption,
  deleteMenuItem,
  getMenuItemForEdit,
  toggleAvailability,
  updateMenuItem,
  type OptionGroup,
} from "@/lib/actions/menu";
import { formatHKD } from "@/lib/utils";

const OPTION_GROUPS: OptionGroup[] = ["走料", "加料", "套餐飲品", "其他"];

type EditData = NonNullable<Awaited<ReturnType<typeof getMenuItemForEdit>>>;

export default function EditMenuItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = use(params);

  const [data, setData] = useState<EditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // 加料選項表單 —— 得靠呢兩個 state 做即時驗證,唔可以淨係靠 native
  // `required`(擋唔到淨係得空格嗰種)同 type="number"(擋唔到 NaN 嗰種)
  const [optionName, setOptionName] = useState("");
  const [optionPriceDelta, setOptionPriceDelta] = useState("0");
  const [optionTouched, setOptionTouched] = useState(false);
  const [optionError, setOptionError] = useState<string | null>(null);
  const [isAddingOption, setIsAddingOption] = useState(false);

  const optionNameInvalid = optionName.trim() === "";
  const optionPriceDeltaInvalid =
    optionPriceDelta.trim() !== "" && Number.isNaN(Number(optionPriceDelta));
  const optionFormInvalid = optionNameInvalid || optionPriceDeltaInvalid;

  const formRef = useRef<HTMLFormElement>(null);
  const optionFormRef = useRef<HTMLFormElement>(null);

  async function reload() {
    const result = await getMenuItemForEdit(itemId);
    if (!result) {
      setLoadError("揾唔到呢個品項,可能已經被刪咗");
      setData(null);
    } else {
      setData(result);
      setLoadError(null);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveOk(false);
    const result = await updateMenuItem(itemId, new FormData(formRef.current));
    setIsSaving(false);
    if (!result.success) {
      setSaveError(result.error);
      return;
    }
    setSaveOk(true);
    await reload();
  }

  async function handleToggleAvailability() {
    await toggleAvailability(itemId);
    await reload();
  }

  async function handleAddOption(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!optionFormRef.current) return;
    setOptionTouched(true);
    if (optionFormInvalid) return;
    setIsAddingOption(true);
    setOptionError(null);
    const result = await createItemOption(itemId, new FormData(optionFormRef.current));
    setIsAddingOption(false);
    if (!result.success) {
      setOptionError(result.error);
      return;
    }
    optionFormRef.current.reset();
    setOptionName("");
    setOptionPriceDelta("0");
    setOptionTouched(false);
    await reload();
  }

  async function handleDeleteOption(optionId: string) {
    await deleteItemOption(optionId);
    await reload();
  }

  async function handleGenerateImage() {
    setImageError(null);
    setIsGeneratingImage(true);
    try {
      const res = await fetch(`/api/admin/menu-items/${itemId}/generate-image`, {
        method: "POST",
      });
      if (!res.ok) {
        setImageError("生相失敗,廚房相機好似又壞咗,遲啲再試");
        return;
      }
      const body = (await res.json()) as { imageUrl?: string };
      if (body.imageUrl && data) {
        setData({ ...data, item: { ...data.item, imageUrl: body.imageUrl } });
      } else {
        await reload();
      }
    } catch {
      setImageError("生相失敗,廚房相機好似又壞咗,遲啲再試");
    } finally {
      setIsGeneratingImage(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        載緊資料…
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[var(--destructive)]">{loadError}</p>
        <Button asChild variant="secondary" size="sm" className="w-fit">
          <Link href="/admin/menu">返去餐牌管理</Link>
        </Button>
      </div>
    );
  }

  const { item, categories, options } = data;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            編輯品項
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">{item.name}</p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/menu">返去餐牌管理</Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>相片</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-md border-[1.5px] border-[var(--cct-milktea-600)] bg-[var(--muted)]">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted-foreground)]">
                重未有相
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isGeneratingImage}
              onClick={handleGenerateImage}
              className="w-fit"
            >
              {isGeneratingImage ? (
                <>
                  <Fan className="h-4 w-4 animate-spin" />
                  生緊相,等陣…
                </>
              ) : (
                "重新生成 AI 相片"
              )}
            </Button>
            {imageError && <p className="text-xs text-[var(--destructive)]">{imageError}</p>}
            <p className="text-xs text-[var(--muted-foreground)]">
              生成需時幾秒,靠 Vercel AI Gateway,唔會即時反映喺客人頁(要生完先算)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>基本資料</CardTitle>
          <div className="flex items-center gap-2">
            {!item.isAvailable && <Badge variant="soldOut">賣晒</Badge>}
            <Button type="button" variant="ghost" size="sm" onClick={handleToggleAvailability}>
              {item.isAvailable ? "標記賣晒" : "翻叫得"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSave} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="categoryId" className="text-sm font-medium">
                分類
              </label>
              <Select
                id="categoryId"
                name="categoryId"
                required
                defaultValue={item.categoryId}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="code" className="text-sm font-medium">
                代號
              </label>
              <Input id="code" name="code" defaultValue={item.code ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                品名
              </label>
              <Input id="name" name="name" required defaultValue={item.name} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="price" className="text-sm font-medium">
                價錢
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={item.price}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="description" className="text-sm font-medium">
                描述
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={item.description ?? ""}
                className="h-auto rounded-md border-[1.5px] border-[var(--input)] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              />
            </div>

            {saveError && (
              <p className="text-sm text-[var(--destructive)] sm:col-span-2">{saveError}</p>
            )}
            {saveOk && !saveError && (
              <p className="text-sm text-[var(--cct-green-600)] sm:col-span-2">
                搞掂,改咗喇
              </p>
            )}

            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "儲緊…" : "儲返"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  if (confirm(`真係要刪走「${item.name}」?呢個冇得反悔`)) {
                    await deleteMenuItem(itemId);
                    window.location.href = "/admin/menu";
                  }
                }}
              >
                刪走呢個品項
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>加料選項(走青/走冰/跟套餐呢類)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {options.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">呢味重未有加料選項</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {options.map((opt) => (
                <li
                  key={opt.id}
                  className="flex items-center justify-between gap-2 rounded-md border-[1.5px] border-[var(--border)] px-3 py-2 text-sm"
                >
                  <span>
                    <Badge variant="chef" className="mr-2">
                      {opt.groupName}
                    </Badge>
                    {opt.name}
                    {Number(opt.priceDelta) !== 0 && (
                      <span className="ml-2 font-[family-name:var(--font-mono-ui)] text-[var(--cct-red-600)]">
                        {Number(opt.priceDelta) > 0 ? "+" : ""}
                        {formatHKD(opt.priceDelta)}
                      </span>
                    )}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteOption(opt.id)}
                  >
                    刪走
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <form
            ref={optionFormRef}
            onSubmit={handleAddOption}
            className="grid grid-cols-1 gap-2 border-t-[1.5px] border-[var(--border)] pt-4 sm:grid-cols-4"
          >
            <Select name="groupName" required defaultValue="其他">
              {OPTION_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
            <div className="flex flex-col gap-1">
              <Input
                name="name"
                placeholder="例如:走青"
                required
                value={optionName}
                onChange={(e) => setOptionName(e.target.value)}
                onBlur={() => setOptionTouched(true)}
              />
              {optionTouched && optionNameInvalid && (
                <p className="text-xs text-[var(--destructive)]">加料名唔可以淨係得空格</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Input
                name="priceDelta"
                type="number"
                step="0.01"
                placeholder="加價(可負可0)"
                value={optionPriceDelta}
                onChange={(e) => setOptionPriceDelta(e.target.value)}
                onBlur={() => setOptionTouched(true)}
              />
              {optionTouched && optionPriceDeltaInvalid && (
                <p className="text-xs text-[var(--destructive)]">加價要係數字</p>
              )}
            </div>
            <Button
              type="submit"
              variant="secondary"
              disabled={isAddingOption || (optionTouched && optionFormInvalid)}
            >
              {isAddingOption ? "加緊…" : "加落去"}
            </Button>
            {optionError && (
              <p className="text-xs text-[var(--destructive)] sm:col-span-4">{optionError}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
