import {
  Paintbrush,
  Code2,
  ClipboardList,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

type UseCase = {
  icon: LucideIcon;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
};

const useCases: UseCase[] = [
  {
    icon: Paintbrush,
    title: "デザイナー",
    description:
      "プロトタイプを数秒で作成。クライアントへの提案が加速",
    bgColor: "bg-pink-50 dark:bg-pink-950/20",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
  {
    icon: Code2,
    title: "開発者",
    description:
      "UIの雛形生成で開発時間を大幅短縮。カスタマイズも自在",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: ClipboardList,
    title: "プロジェクトマネージャー",
    description:
      "ダッシュボードやレポートを即座に可視化",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: GraduationCap,
    title: "学生",
    description:
      "Web開発の学習に最適。実際に動くUIで理解が深まる",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

export function UseCaseSection() {
  return (
    <section className="bg-gray-50/50 py-20 dark:bg-gray-950/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            あらゆる人に、最適なUI体験を
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            職種やスキルレベルを問わず、誰でもプロ品質のUIを作れます。
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <div
                key={useCase.title}
                className={`rounded-2xl p-6 ${useCase.bgColor} transition-all duration-300 hover:scale-[1.02]`}
              >
                <Icon className={`mb-4 h-8 w-8 ${useCase.iconColor}`} />
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {useCase.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {useCase.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
