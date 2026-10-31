import calibration from './digital-calibration-data.js';

export const digitalCalibrationMetadata=Object.freeze(calibration.metadata);
const DAY_MS=86400000;
const epoch=Date.parse(`${calibration.metadata.epochDate}T00:00:00Z`);
const scenarios=new Set(['accelerated','central','conservative']);
const quantile=(sorted,p)=>{
  const index=(sorted.length-1)*p;
  const low=Math.floor(index),high=Math.ceil(index);
  return sorted[low]+(sorted[high]-sorted[low])*(index-low);
};
const cross=(duration,fit)=>(Math.log2(duration)-fit.interceptLog2Minutes)/fit.slopeLog2MinutesPerDay;
const toDate=days=>new Date(epoch+days*DAY_MS).toISOString().slice(0,10);

/**
 * Estimate a software-benchmark milestone from published numeric measurements.
 * This is NOT a full-automation forecast. The caller must supply a human-expert
 * task duration and establish compatibility with the benchmark task domain.
 * Only METR's measured 50% and 80% success thresholds are supported.
 */
export function estimateDigitalMilestone({durationMinutes,successTarget=.8,scenario='central',assessmentYear=2026}={}) {
  if(typeof durationMinutes!=='number'||!Number.isFinite(durationMinutes)||durationMinutes<=0)throw new RangeError('durationMinutes must be a positive finite human-expert task duration.');
  if(!scenarios.has(scenario))throw new RangeError(`Unknown scenario: ${scenario}`);
  if(!Number.isInteger(assessmentYear)||assessmentYear<2026||assessmentYear>3000)throw new RangeError('assessmentYear must be an integer from 2026 to 3000.');
  if(successTarget!==.5&&successTarget!==.8)return {
    supported:false,pointYear:null,baselineYear:null,status:'unsupported reliability target',durationMinutes,successTarget,
    reason:'METR publishes 50% and 80% horizons. There is insufficient empirical evidence here to estimate this success target.',
    supportedSuccessTargets:[.5,.8],evidenceIds:[...calibration.evidenceIds],
    empirical:calibration.metadata,assumptions:[],limitations:[...calibration.limitations],
    uncertainty:{kind:'not estimable from this dataset',calibratedOccupationForecast:false}
  };
  const metric=successTarget===.5?'p50':'p80';
  const fit=calibration.fits[metric].primary;
  const centralDays=cross(durationMinutes,fit);
  const bootstrapCrossings=calibration.bootstrap[metric].coefficientPairs.map(([intercept,slope])=>(Math.log2(durationMinutes)-intercept)/slope).filter(Number.isFinite).sort((a,b)=>a-b);
  const p10=Math.min(centralDays,quantile(bootstrapCrossings,.1));
  const p90=Math.max(centralDays,quantile(bootstrapCrossings,.9));
  const selectedDays=scenario==='accelerated'?p10:scenario==='conservative'?p90:centralDays;
  const crossingDate=toDate(selectedDays);
  const pointYear=Math.max(assessmentYear,Number(crossingDate.slice(0,4)));
  const lastObserved=Date.parse(`${fit.lastRelease}T00:00:00Z`);
  const extrapolationYears=Math.max(0,(epoch+selectedDays*DAY_MS-lastObserved)/(365.2425*DAY_MS));
  const aboveMeasurementBoundary=durationMinutes>calibration.metadata.measurementBoundaryMinutes;
  const alternativeFits=Object.entries(calibration.fits[metric]).map(([name,value])=>({name,crossingDate:toDate(cross(durationMinutes,value)),doublingDays:value.doublingDays,n:value.n}));
  return {
    supported:true,pointYear,baselineYear:pointYear,crossingDate,status:aboveMeasurementBoundary?'outside measured task-duration range':'conditional software benchmark milestone',
    durationMinutes,successTarget,scenario,
    formula:{expression:'log2(horizon_minutes) = intercept + slope × days_since_2023_01_01; crossing_days = (log2(requested_minutes) − intercept) / slope',
      interceptLog2Minutes:fit.interceptLog2Minutes,slopeLog2MinutesPerDay:fit.slopeLog2MinutesPerDay,
      doublingDays:fit.doublingDays,centralCrossingDate:toDate(centralDays),
      selectedCrossingDays:selectedDays,scenarioRule:scenario==='central'?'Primary ordinary least squares point estimate':`${scenario==='accelerated'?'10th':'90th'} percentile of model-point resampling crossing dates, constrained around the central estimate`,
      calendarRule:'Calendar year containing the crossing date, no earlier than assessmentYear; not precision to an exact year.'},
    empirical:{sourceUrl:calibration.metadata.sourceUrl,sourceSha256:calibration.metadata.sourceSha256,benchmark:'METR-Horizon-v1.1',
      observedModels:fit.n,firstRelease:fit.firstRelease,lastRelease:fit.lastRelease,
      rSquared:fit.rSquared,fitMethod:'Unweighted OLS of log2 published horizon minutes on release date',
      publishedOfficialP50DoublingDays:calibration.metadata.officialP50DoublingDays,
      primarySelection:calibration.metadata.selection,holdout:calibration.validation[metric]},
    assumptions:[...calibration.assumptions],
    limitations:[...calibration.limitations,...(assessmentYear>2026?['The assessment year changed, but the measurements and fitted model remain anchored to the 2026 review.']:[])],
    evidenceIds:[...calibration.evidenceIds],
    uncertainty:{kind:'Empirical fit sensitivity; not a calibrated forecast interval',calibratedOccupationForecast:false,
      bootstrapSensitivityDates:{p10:toDate(p10),p90:toDate(p90),iterations:bootstrapCrossings.length},alternativeFits,
      extrapolationYears:Number(extrapolationYears.toFixed(2)),aboveMeasurementBoundary,
      measurementBoundaryMinutes:calibration.metadata.measurementBoundaryMinutes,
      measurementErrorCovarianceModeled:false,
      holdoutWarning:'Retrospective release-date split on later-measured data; correlated models and shared task-suite uncertainty.'}
  };
}
