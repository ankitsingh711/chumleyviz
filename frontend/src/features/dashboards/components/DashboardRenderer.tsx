import type { DashboardRecord, DashboardWidget } from '@/types/models';

function Widget({ widget }: { widget: DashboardWidget }) {
  switch (widget.kind) {
    case 'metric':
      return (
        <article className="widget-card widget-card--metric">
          <span className="widget-card__eyebrow">Metric</span>
          <h3>{widget.title}</h3>
          <strong>{widget.value}</strong>
          {widget.delta ? <p>{widget.delta}</p> : null}
        </article>
      );
    case 'trend':
      return (
        <article className="widget-card">
          <span className="widget-card__eyebrow">Trend</span>
          <h3>{widget.title}</h3>
          <div className="widget-trend">
            {(widget.series ?? []).map((value, index) => (
              <span
                key={`${widget.id}-${index}`}
                className="widget-trend__bar"
                style={{ height: `${Math.max(18, value)}%` }}
              />
            ))}
          </div>
          {widget.value ? <p>{widget.value}</p> : null}
        </article>
      );
    case 'bar':
      return (
        <article className="widget-card">
          <span className="widget-card__eyebrow">Breakdown</span>
          <h3>{widget.title}</h3>
          <div className="widget-bars">
            {(widget.series ?? []).map((value, index) => (
              <div key={`${widget.id}-${index}`} className="widget-bars__row">
                <span className="widget-bars__label">Metric {index + 1}</span>
                <span className="widget-bars__bar">
                  <span className="widget-bars__fill" style={{ width: `${Math.min(value, 100)}%` }} />
                </span>
              </div>
            ))}
          </div>
        </article>
      );
    case 'table':
      return (
        <article className="widget-card widget-card--table">
          <span className="widget-card__eyebrow">Table</span>
          <h3>{widget.title}</h3>
          <div className="table-frame">
            <div className="table-frame__header">
              {(widget.columns ?? []).map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            {(widget.rows ?? []).map((row, rowIndex) => (
              <div key={`${widget.id}-${rowIndex}`} className="table-frame__row">
                {row.map((cell) => (
                  <span key={`${widget.id}-${rowIndex}-${cell}`}>{cell}</span>
                ))}
              </div>
            ))}
          </div>
        </article>
      );
    case 'note':
      return (
        <article className="widget-card widget-card--note">
          <span className="widget-card__eyebrow">Narrative</span>
          <h3>{widget.title}</h3>
          <p>{widget.body}</p>
        </article>
      );
    default:
      return null;
  }
}

export function DashboardRenderer({ dashboard }: { dashboard: DashboardRecord }) {
  return (
    <div className="dashboard-renderer">
      <header className="dashboard-renderer__hero panel">
        <div>
          <span className="pill">Dynamic dashboard</span>
          <h1>{dashboard.title}</h1>
          <p>{dashboard.description}</p>
        </div>
        <div className="dashboard-renderer__stats">
          <div>
            <span className="dashboard-renderer__label">Owner</span>
            <strong>{dashboard.owner}</strong>
          </div>
          <div>
            <span className="dashboard-renderer__label">Category</span>
            <strong>{dashboard.category}</strong>
          </div>
          <div>
            <span className="dashboard-renderer__label">Widgets</span>
            <strong>{dashboard.widgetCount}</strong>
          </div>
        </div>
      </header>

      <div className="widget-grid">
        {dashboard.widgets.map((widget) => (
          <Widget key={widget.id} widget={widget} />
        ))}
      </div>
    </div>
  );
}
