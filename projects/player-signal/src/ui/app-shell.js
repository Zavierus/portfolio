export function renderAppShell() {
  return `
    <div class="observation-station" data-player-signal-app>
      <header class="product-bar">
        <a class="product-bar__back" href="../../index.html?ziaver=latest" aria-label="返回作品集">← 作品集</a>
        <div class="product-mark" translate="no"><span>PLAYER</span><b>SIGNAL</b></div>
        <div class="product-bar__center">
          <div class="live-progress" data-analysis-progress hidden>
            <span class="live-progress__text" data-progress-text>正在聚合信号...</span>
            <div class="live-progress__track"><i class="live-progress__bar" data-progress-bar style="width:0%"></i></div>
          </div>
        </div>
        <p class="product-state"><i aria-hidden="true"></i><span data-product-state aria-live="polite">准备就绪</span></p>
      </header>

      <section class="source-console" aria-label="数据源与样本状态">
        <div class="connector-panel">
          <form class="game-search" data-game-search aria-label="搜索 Steam 游戏">
            <div class="connector-panel__label"><span>在线数据连接器</span><strong data-connector-status aria-live="polite">连接器检测中…</strong></div>
            <div class="game-search__input">
              <input id="game-query" data-game-query name="query" type="search" autocomplete="off" placeholder="输入游戏名称，例如 No Man’s Sky…" disabled />
              <button type="submit" disabled>搜索</button>
            </div>
          </form>
          <label class="review-language" for="review-language"><span>评论语言 / REVIEW LANGUAGE</span><select id="review-language" data-review-language><option value="schinese">中文优先 / Simplified Chinese</option><option value="english">English</option><option value="all">全部语言 / All</option></select></label>
          <div class="game-results" data-search-results role="listbox" aria-label="Steam 游戏搜索结果" hidden></div>
        </div>
        
        <div class="demo-select-container">
          <button class="demo-action" type="button" data-open-demo>
            <span>内置精选案例库</span>
            <strong data-active-case-title>重新打开 No Man’s Sky</strong>
          </button>
          <select class="offline-case-select" data-offline-case-picker aria-label="选择离线分析案例">
            <option value="">No Man's Sky (默认案例 · 3000条)</option>
            <option value="steam:620">Portal 2 · 传送门2</option>
            <option value="steam:292030">The Witcher 3 · 巫师3狂猎</option>
            <option value="steam:1145360">Hades · 黑帝斯</option>
            <option value="steam:413150">Stardew Valley · 星露谷物语</option>
            <option value="steam:646570">Slay the Spire · 杀戮尖塔</option>
            <option value="steam:632470">Disco Elysium · 极乐迪斯科</option>
            <option value="steam:367520">Hollow Knight · 空洞骑士</option>
            <option value="steam:753640">Outer Wilds · 星际拓荒</option>
          </select>
        </div>

        <div class="source-readout" data-source-status role="status" aria-live="polite">
          <span>当前数据源</span><strong data-source-title>No Man’s Sky</strong><small data-source-detail>不保存玩家身份</small>
        </div>
        <div class="sample-ledger" data-sample-accounting>
          <div class="sample-ledger__head"><span>样本账本</span><strong data-sample-summary>--</strong></div>
          <div class="sample-ledger__counts">
            <span><b data-fetched-count>--</b>获取</span>
            <span><b data-accepted-count>--</b>有效</span>
            <span><b data-classified-count>--</b>已分类</span>
            <span><b data-unclassified-count>--</b>待分类</span>
            <span><b data-excluded-count>--</b>排除</span>
          </div>
          <div class="coverage-meter"><span>分类覆盖</span><i><b data-coverage-bar></b></i><strong data-coverage-rate>--</strong></div>
          <details class="exclusion-details"><summary data-sample-range>查看样本范围</summary><div data-exclusion-reasons></div></details>
        </div>
      </section>

      <main class="station-grid" id="analysis-workspace">
        <aside class="signal-queues" aria-label="信号队列">
          <header><span>调查视图</span><h1>发生了什么？</h1><p>用不同业务角度查看同一份匿名玩家证据。</p></header>
          <nav aria-label="问题信号队列">
            <button type="button" data-queue="new"><span>新出现</span><strong data-topic-count>--</strong><small>此前窗口没有出现</small></button>
            <button type="button" data-queue="growing"><span>增长最快</span><strong data-topic-count>--</strong><small>相对前一窗口加速</small></button>
            <button type="button" data-queue="largest"><span>反馈最多</span><strong data-topic-count>--</strong><small>有效样本量最大</small></button>
            <button type="button" data-queue="core"><span>核心玩家集中</span><strong data-topic-count>--</strong><small>高时长玩家占比较高</small></button>
            <button type="button" data-queue="persistent"><span>持续存在</span><strong data-topic-count>--</strong><small>当前与前一窗口均出现</small></button>
            <button type="button" data-queue="unclassified"><span>待分类评论</span><strong data-topic-count>--</strong><small>未强制归入任何主题</small></button>
          </nav>
          <div class="method-note">
            <span>方法边界</span>
            <p>观察值来自数量与时间；分析判断来自规则主题和透明权重。时间关联不是因果证明。</p>
            <p class="legend-note">圆体大小映射反馈量，亮度映射增长速度，脉冲映射异常偏离。</p>
          </div>
          <fieldset class="weight-panel">
            <legend>优先级权重</legend>
            <label><span>体量</span><input type="range" min="0" max="100" value="35" data-priority-weight="volume" /><output>35</output></label>
            <label><span>增速</span><input type="range" min="0" max="100" value="30" data-priority-weight="velocity" /><output>30</output></label>
            <label><span>核心影响</span><input type="range" min="0" max="100" value="20" data-priority-weight="coreImpact" /><output>20</output></label>
          </fieldset>
        </aside>

        <section class="field-column" aria-label="信号透镜与演变">
          <div class="signal-lens" aria-label="信号场域">
            <header class="lens-header">
              <div>
                <span>3D 信号空间 · 实时聚合透镜</span>
                <h2 data-active-game-title>No Man’s Sky</h2>
              </div>
              <div class="view-switch" role="group" aria-label="视图切换">
                <button type="button" data-view="field" aria-pressed="true">3D 场域</button>
                <button type="button" data-view="table" aria-pressed="false">表格明细</button>
              </div>
            </header>

            <div class="lens-stage">
              <canvas class="signal-canvas" data-signal-canvas></canvas>
              <div class="lens-empty" data-lens-empty hidden><p>暂无信号数据</p></div>
              <div class="filter-empty" data-filter-empty hidden>
                <h3 data-filter-empty-title>当前队列暂无匹配主题</h3>
                <p data-filter-empty-detail>可尝试切换其他队列或清除筛选。</p>
                <button type="button" data-clear-queue>查看全部主题</button>
              </div>
              <div class="unclassified-view" data-unclassified-view hidden>
                <header><strong data-unclassified-summary>待分类评论</strong></header>
                <div class="unclassified-list" data-unclassified-list></div>
              </div>
            </div>

            <div class="signal-table-wrap" data-signal-table hidden>
              <table>
                <thead>
                  <tr>
                    <th>主题分类</th>
                    <th>样本量</th>
                    <th>相对增速</th>
                    <th>核心玩家占比</th>
                    <th>建议状态</th>
                  </tr>
                </thead>
                <tbody data-signal-table-body></tbody>
              </table>
            </div>

            <footer class="lens-footer">
              <span data-lens-range>匿名评论采样已就绪</span>
            </footer>
          </div>

          <div class="version-rail" data-comparison aria-label="时间线对比">
            <header><span>版本与时间跨度演变</span></header>
            <div class="comparison-content" data-comparison-content></div>
          </div>
        </section>

        <aside class="investigation" data-investigation aria-label="深度归因与证据链">
          <header>
            <span>深度归因</span>
            <h2>证据链与行动卡</h2>
          </header>
          <div class="investigation-empty" data-investigation-empty>
            <span data-investigation-empty-label>选择一个信号</span>
            <strong data-investigation-empty-title>点击左侧 3D 节点或表格</strong>
            <p data-investigation-empty-detail>查看玩家真实原话、版本归因和推荐处理行动卡。</p>
          </div>
          <div class="investigation-content" data-investigation-content hidden></div>
          <footer class="investigation-footer">
            <button class="export-btn" type="button" data-export-action disabled>
              <strong>导出行动卡 (Markdown / JSON)</strong>
            </button>
          </footer>
        </aside>
      </main>

      <dialog class="correction-dialog" data-correction-dialog>
        <form data-correction-form method="dialog">
          <h3 data-correction-title>校正主题</h3>
          <p data-correction-description>对该主题进行人工修正</p>
          <div data-rename-field>
            <label>新主题名称: <input type="text" name="label" /></label>
          </div>
          <div data-merge-field hidden>
            <label>合并至目标: <select name="target"></select></label>
          </div>
          <p class="correction-preview" data-correction-preview></p>
          <p class="correction-error" data-correction-error></p>
          <div class="dialog-actions">
            <button type="button" data-correction-cancel>取消</button>
            <button type="submit">确认应用</button>
          </div>
        </form>
      </dialog>
    </div>
  `;
}

export function mountAppShell(root) {
  if (!(root instanceof Element)) throw new TypeError("PLAYER SIGNAL requires a root element");
  root.innerHTML = renderAppShell();
  return Object.freeze({
    app: root.querySelector("[data-player-signal-app]"),
    searchForm: root.querySelector("[data-game-search]"),
    searchInput: root.querySelector("[data-game-query]"),
    searchSubmit: root.querySelector("[data-game-search] button[type='submit']"),
    searchResults: root.querySelector("[data-search-results]"),
    reviewLanguage: root.querySelector("[data-review-language]"),
    connectorStatus: root.querySelector("[data-connector-status]"),
    openDemo: root.querySelector("[data-open-demo]"),
    offlineCasePicker: root.querySelector("[data-offline-case-picker]"),
    activeCaseTitle: root.querySelector("[data-active-case-title]"),
    activeGameTitle: root.querySelector("[data-active-game-title]"),
    sourceStatus: root.querySelector("[data-source-status]"),
    sourceTitle: root.querySelector("[data-source-title]"),
    sourceDetail: root.querySelector("[data-source-detail]"),
    sampleAccounting: root.querySelector("[data-sample-accounting]"),
    sampleSummary: root.querySelector("[data-sample-summary]"),
    fetchedCount: root.querySelector("[data-fetched-count]"),
    acceptedCount: root.querySelector("[data-accepted-count]"),
    classifiedCount: root.querySelector("[data-classified-count]"),
    unclassifiedCount: root.querySelector("[data-unclassified-count]"),
    excludedCount: root.querySelector("[data-excluded-count]"),
    coverageBar: root.querySelector("[data-coverage-bar]"),
    coverageRate: root.querySelector("[data-coverage-rate]"),
    sampleRange: root.querySelector("[data-sample-range]"),
    exclusionReasons: root.querySelector("[data-exclusion-reasons]"),
    lensRange: root.querySelector("[data-lens-range]"),
    progress: root.querySelector("[data-analysis-progress]"),
    progressBar: root.querySelector("[data-progress-bar]"),
    progressText: root.querySelector("[data-progress-text]"),
    lensEmpty: root.querySelector("[data-lens-empty]"),
    filterEmpty: root.querySelector("[data-filter-empty]"),
    filterEmptyTitle: root.querySelector("[data-filter-empty-title]"),
    filterEmptyDetail: root.querySelector("[data-filter-empty-detail]"),
    clearQueue: root.querySelector("[data-clear-queue]"),
    unclassifiedView: root.querySelector("[data-unclassified-view]"),
    unclassifiedSummary: root.querySelector("[data-unclassified-summary]"),
    unclassifiedList: root.querySelector("[data-unclassified-list]"),
    canvas: root.querySelector("[data-signal-canvas]"),
    table: root.querySelector("[data-signal-table]"),
    tableBody: root.querySelector("[data-signal-table-body]"),
    viewButtons: [...root.querySelectorAll("[data-view]")],
    queueButtons: [...root.querySelectorAll("[data-queue]")],
    priorityWeights: [...root.querySelectorAll("[data-priority-weight]")],
    investigationContent: root.querySelector("[data-investigation-content]"),
    investigationEmpty: root.querySelector("[data-investigation-empty]"),
    investigationEmptyLabel: root.querySelector("[data-investigation-empty-label]"),
    investigationEmptyTitle: root.querySelector("[data-investigation-empty-title]"),
    investigationEmptyDetail: root.querySelector("[data-investigation-empty-detail]"),
    comparisonContent: root.querySelector("[data-comparison-content]"),
    exportAction: root.querySelector("[data-export-action]"),
    productState: root.querySelector("[data-product-state]"),
    correctionDialog: root.querySelector("[data-correction-dialog]"),
    correctionForm: root.querySelector("[data-correction-form]"),
    correctionTitle: root.querySelector("[data-correction-title]"),
    correctionDescription: root.querySelector("[data-correction-description]"),
    renameField: root.querySelector("[data-rename-field]"),
    mergeField: root.querySelector("[data-merge-field]"),
    correctionPreview: root.querySelector("[data-correction-preview]"),
    correctionError: root.querySelector("[data-correction-error]"),
    correctionCancel: root.querySelector("[data-correction-cancel]"),
  });
}
