import { buildBoardLayout } from './board-layout-generator.js';
import { buildCalendarLayout } from './calendar-layout-generator.js';
import { buildCardGridLayout } from './card-grid-layout-generator.js';
import { buildChatLayout } from './chat-layout-generator.js';
import { buildDataTableLayout } from './data-table-layout-generator.js';
import { buildEditorLayout } from './editor-layout-generator.js';
import { buildLedgerLayout } from './ledger-layout-generator.js';
import { buildMediaLibraryLayout } from './media-library-layout-generator.js';
import { buildPosLayout } from './pos-layout-generator.js';
import { buildProgressDashboardLayout } from './progress-dashboard-layout-generator.js';
import { buildKanbanLayout } from './kanban-layout-generator.js';
import {
  buildDashboardLayout,
  buildSplitViewLayout,
} from './split-view-layout-generator.js';
import { buildTimetableLayout } from './timetable-layout-generator.js';
import type { LayoutBuildContext, LayoutBuildResult } from './layout-generator-shared.js';

export function buildUiLayoutHomePage(ctx: LayoutBuildContext): LayoutBuildResult {
  switch (ctx.strategy.layoutPattern) {
    case 'calendar':
      return buildCalendarLayout(ctx);
    case 'kanban':
      return buildKanbanLayout(ctx);
    case 'data-table':
      return buildDataTableLayout(ctx);
    case 'card-grid':
      return buildCardGridLayout(ctx);
    case 'editor':
      return buildEditorLayout(ctx);
    case 'ledger':
      return buildLedgerLayout(ctx);
    case 'pos':
      return buildPosLayout(ctx);
    case 'chat':
      return buildChatLayout(ctx);
    case 'media-library':
      return buildMediaLibraryLayout(ctx);
    case 'timetable':
      return buildTimetableLayout(ctx);
    case 'progress-dashboard':
      return buildProgressDashboardLayout(ctx);
    case 'board':
      return buildBoardLayout(ctx);
    case 'dashboard':
      return buildDashboardLayout(ctx);
    case 'split-view':
    default:
      return buildSplitViewLayout(ctx);
  }
}
