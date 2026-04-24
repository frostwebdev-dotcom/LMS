import { getAllModulesForAdmin } from "@/services/module-service";
import { getTrainingCategoriesForAdmin } from "@/services/training-category-service";
import type { AdminTrainingCategoryBlock } from "@/types/admin-dashboard";
import type { TrainingModule } from "@/types/database";

/**
 * Admin dashboard: categories in display order, each with its modules (by category_id).
 * Categories with zero modules still appear. Orphan module category_ids get an "Other" block.
 */
export async function getAdminTrainingByCategory(): Promise<AdminTrainingCategoryBlock[]> {
  const [categories, modules] = await Promise.all([
    getTrainingCategoriesForAdmin(),
    getAllModulesForAdmin(),
  ]);

  const grouped = new Map<string, TrainingModule[]>();
  for (const c of categories) {
    grouped.set(c.id, []);
  }
  for (const m of modules) {
    const arr = grouped.get(m.category_id);
    if (arr) {
      arr.push(m);
    } else {
      grouped.set(m.category_id, [m]);
    }
  }

  const blocks: AdminTrainingCategoryBlock[] = categories.map((category) => ({
    category,
    modules: (grouped.get(category.id) ?? []).sort((a, b) => a.sort_order - b.sort_order),
  }));

  const knownIds = new Set(categories.map((c) => c.id));
  const orphanBlocks: AdminTrainingCategoryBlock[] = [];
  for (const [catId, mods] of grouped.entries()) {
    if (knownIds.has(catId)) continue;
    orphanBlocks.push({
      category: {
        id: catId,
        name: "Other",
        slug: "other",
        description: "Modules tied to a category not shown in the main list.",
        icon: null,
        display_order: 999,
        is_active: false,
        created_at: "",
        updated_at: "",
      },
      modules: mods.sort((a, b) => a.sort_order - b.sort_order),
    });
  }

  return [...blocks, ...orphanBlocks];
}
